
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { TemplateEditDialog, Template } from "./TemplateEditDialog";
import { toast } from "sonner";

export const TemplatesSettings = () => {
  const [templates, setTemplates] = useState<Template[]>([
    {
      id: "1",
      name: "Ubuntu",
      description: "Ubuntu 22.04 con soporte para CUDA",
      imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475"
    },
    {
      id: "2",
      name: "ComfyUI",
      description: "ComfyUI con dependencias preinstaladas",
      imageUrl: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6"
    }
  ]);
  
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template);
    setIsDialogOpen(true);
  };

  const handleSaveTemplate = (updatedTemplate: Template) => {
    setTemplates(prevTemplates => 
      prevTemplates.map(template => 
        template.id === updatedTemplate.id ? updatedTemplate : template
      )
    );
    toast.success("Plantilla actualizada correctamente");
  };

  const handleCreateTemplate = () => {
    const newTemplate: Template = {
      id: `${templates.length + 1}`,
      name: "Nueva Plantilla",
      description: "Descripción de la nueva plantilla",
      imageUrl: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d"
    };
    
    setEditingTemplate(newTemplate);
    setIsDialogOpen(true);
  };

  const handleSaveNewTemplate = (newTemplate: Template) => {
    setTemplates(prev => [...prev, newTemplate]);
    toast.success("Nueva plantilla creada correctamente");
  };

  return (
    <Card className="max-w-5xl mx-auto">
      <CardHeader className="pb-3">
        <CardTitle>Gestión de Plantillas</CardTitle>
        <CardDescription>Configura las plantillas disponibles para los pods</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          {templates.map(template => (
            <div key={template.id} className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4">
              <div className="flex gap-4 items-center w-full md:w-auto">
                <div className="w-20 h-20 hidden sm:block">
                  <AspectRatio ratio={1/1} className="bg-muted rounded-md overflow-hidden">
                    <img 
                      src={template.imageUrl} 
                      alt={template.name}
                      className="object-cover w-full h-full"
                    />
                  </AspectRatio>
                </div>
                <div>
                  <h3 className="font-medium">{template.name}</h3>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={() => handleEditTemplate(template)}
                className="mt-2 md:mt-0"
              >
                Editar
              </Button>
            </div>
          ))}
          
          <div className="flex justify-between items-center pt-2">
            <div>
              <h3 className="font-medium">Crear Nueva Plantilla</h3>
              <p className="text-sm text-muted-foreground">Configura una nueva plantilla</p>
            </div>
            <Button onClick={handleCreateTemplate}>Crear</Button>
          </div>
        </div>
      </CardContent>

      <TemplateEditDialog
        template={editingTemplate}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={editingTemplate?.id && templates.some(t => t.id === editingTemplate.id) 
          ? handleSaveTemplate 
          : handleSaveNewTemplate}
      />
    </Card>
  );
};
