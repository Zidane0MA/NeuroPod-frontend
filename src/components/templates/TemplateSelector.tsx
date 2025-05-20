import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { HelpCircle } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Template } from "@/types/template";
import { templateService } from "@/services/template.service";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

interface TemplateSelectorProps {
  onSelectTemplate: (template: Template) => void;
  selectedTemplate: Template | null;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  onSelectTemplate,
  selectedTemplate
}) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDescription, setShowDescription] = useState(false);

  useEffect(() => {
    if (showModal) {
      fetchTemplates();
    }
  }, [showModal]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const data = await templateService.getTemplates();
      setTemplates(data);
    } catch (err) {
      toast.error("Error al cargar plantillas");
      console.error("Error fetching templates:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (template: Template) => {
    onSelectTemplate(template);
    setShowModal(false);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {selectedTemplate ? (
          <>
            <Button
              variant="outline"
              className="w-full justify-start overflow-hidden text-ellipsis"
              onClick={() => setShowModal(true)}
            >
              {selectedTemplate.name} seleccionado
            </Button>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => setShowDescription(true)}
                  >
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Ver detalles del template</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </>
        ) : (
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => setShowModal(true)}
          >
            Elegir template
          </Button>
        )}
      </div>

      {/* Template selection modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-3xl h-[80vh] max-h-[800px] flex flex-col">
          <DialogHeader>
            <DialogTitle>Seleccionar Plantilla</DialogTitle>
          </DialogHeader>
          
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : templates.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-center">
              <div>
                <p className="text-muted-foreground mb-2">No hay plantillas disponibles</p>
                <p className="text-sm">Contacta con el administrador para crear nuevas plantillas</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-auto grid grid-cols-1 md:grid-cols-2 gap-4 p-1">
              {templates.map((template) => (
                <Card 
                  key={template.id} 
                  className={`cursor-pointer border-2 hover:border-primary hover:shadow-md transition-all
                    ${selectedTemplate?.id === template.id ? 'border-primary' : 'border-border'}`}
                  onClick={() => handleSelect(template)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle>{template.name}</CardTitle>
                    <CardDescription className="text-xs">
                      <span className="font-medium">Imagen:</span> {template.dockerImage}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span>Puertos: {template.ports}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Container Disk: {template.containerDiskSize} GB</span>
                      <span>Volume Disk: {template.volumeDiskSize} GB</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Template description modal */}
      <Dialog open={showDescription} onOpenChange={setShowDescription}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedTemplate?.name} - Detalles</DialogTitle>
          </DialogHeader>
          <div className="prose prose-sm max-w-none mt-2 overflow-auto max-h-[60vh]">
            {selectedTemplate && (
              <ReactMarkdown>{selectedTemplate.description}</ReactMarkdown>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
