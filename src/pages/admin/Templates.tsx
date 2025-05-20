import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { Template } from "@/types/template";
import { templateService } from "@/services/template.service";
import ReactMarkdown from "react-markdown";

const AdminTemplates = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Template, "id">>({
    name: "",
    dockerImage: "",
    ports: "8888",
    containerDiskSize: 10,
    volumeDiskSize: 20,
    description: ""
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const data = await templateService.getTemplates();
      setTemplates(data);
    } catch (err) {
      toast.error("Error al cargar plantillas");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (template?: Template) => {
    if (template) {
      // Edit mode
      setEditMode(true);
      setCurrentTemplateId(template.id);
      setForm({
        name: template.name,
        dockerImage: template.dockerImage,
        ports: template.ports,
        containerDiskSize: template.containerDiskSize,
        volumeDiskSize: template.volumeDiskSize,
        description: template.description
      });
    } else {
      // Create mode
      setEditMode(false);
      setCurrentTemplateId(null);
      setForm({
        name: "",
        dockerImage: "",
        ports: "8888",
        containerDiskSize: 10,
        volumeDiskSize: 20,
        description: ""
      });
    }
    setShowModal(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSliderChange = (field: "containerDiskSize" | "volumeDiskSize", value: number) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      if (editMode && currentTemplateId) {
        // Update existing template
        const updatedTemplate = await templateService.updateTemplate(currentTemplateId, form);
        setTemplates((prev) => prev.map(t => t.id === currentTemplateId ? updatedTemplate : t));
        toast.success("Plantilla actualizada correctamente");
      } else {
        // Create new template
        const newTemplate = await templateService.createTemplate(form);
        setTemplates((prev) => [...prev, newTemplate]);
        toast.success("Plantilla creada correctamente");
      }
      setShowModal(false);
    } catch (err) {
      toast.error(editMode ? "Error al actualizar plantilla" : "Error al crear plantilla");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta plantilla?")) return;
    try {
      await templateService.deleteTemplate(id);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      toast.success("Plantilla eliminada");
    } catch (err) {
      toast.error("Error al eliminar plantilla");
    }
  };

  return (
    <DashboardLayout title="Administrar Plantillas">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Plantillas de Pods</h1>
        <Button onClick={() => handleOpenModal()}>Crear Plantilla</Button>
      </div>
      {loading ? (
        <div className="text-center py-10">Cargando...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {templates.map((tpl) => (
            <Card key={tpl.id}>
              <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle>{tpl.name}</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleOpenModal(tpl)}>
                    Editar
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(tpl.id)}>
                    Eliminar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-2">
                  <strong>Imagen Docker:</strong> {tpl.dockerImage}
                </div>
                <div className="mb-2">
                  <strong>Puertos:</strong> {tpl.ports}
                </div>
                <div className="mb-2">
                  <strong>Container Disk:</strong> {tpl.containerDiskSize} GB
                </div>
                <div className="mb-2">
                  <strong>Volume Disk:</strong> {tpl.volumeDiskSize} GB
                </div>
                <div className="mb-2">
                  <strong>Descripción:</strong>
                  <div className="prose prose-sm max-w-none mt-1">
                    <ReactMarkdown>{tpl.description}</ReactMarkdown>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editMode ? 'Editar Plantilla' : 'Crear Plantilla'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input name="name" placeholder="Nombre de la plantilla" value={form.name} onChange={handleChange} />
            <Input name="dockerImage" placeholder="Imagen Docker" value={form.dockerImage} onChange={handleChange} />
            <Input name="ports" placeholder="Puertos (ej: 8888, 22)" value={form.ports} onChange={handleChange} />
            <div>
              <label>Container Disk Size: {form.containerDiskSize} GB</label>
              <Slider min={5} max={100} step={5} defaultValue={[form.containerDiskSize]} onValueChange={val => handleSliderChange("containerDiskSize", val[0])} />
            </div>
            <div>
              <label>Volume Disk Size: {form.volumeDiskSize} GB</label>
              <Slider min={10} max={500} step={10} defaultValue={[form.volumeDiskSize]} onValueChange={val => handleSliderChange("volumeDiskSize", val[0])} />
            </div>
            <Textarea name="description" placeholder="Descripción en markdown" value={form.description} onChange={handleChange} rows={5} />
          </div>
          <DialogFooter>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Guardando..." : (editMode ? "Actualizar" : "Crear")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdminTemplates;
