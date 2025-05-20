import React, { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Server, HardDrive } from "lucide-react";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { podService, PodCreateParams } from "@/services/pod.service";
import { TemplateSelector } from "@/components/templates/TemplateSelector";
import { Template } from "@/types/template";

interface GpuOption {
  id: string;
  name: string;
  available: boolean;
  price: number;
  vram: string;
  cores: number;
  image: string;
}

const gpuOptions: GpuOption[] = [
  {
    id: "rtx-4050",
    name: "NVIDIA RTX 4050",
    available: true,
    price: 2.50,
    vram: "6GB",
    cores: 2560,
    image: "gpu-4050.jpg"
  },
  {
    id: "rtx-4080",
    name: "NVIDIA RTX 4080",
    available: false,
    price: 4.99,
    vram: "16GB",
    cores: 9728,
    image: "gpu-4080.jpg"
  },
  {
    id: "rtx-4090",
    name: "NVIDIA RTX 4090",
    available: false,
    price: 8.99,
    vram: "24GB",
    cores: 16384,
    image: "gpu-4090.jpg"
  }
];

const ClientPodDeploy = () => {
  const [selectedGpu, setSelectedGpu] = useState<GpuOption | null>(null);
  const [containerDiskSize, setContainerDiskSize] = useState(10);
  const [volumeDiskSize, setVolumeDiskSize] = useState(20);
  const [showConfigSection, setShowConfigSection] = useState(false);
  const [useJupyter, setUseJupyter] = useState(true);
  const [podName, setPodName] = useState("");
  const [ports, setPorts] = useState("8888");
  const [template, setTemplate] = useState("ubuntu");
  const [deploymentType, setDeploymentType] = useState("template"); // template o docker
  const [dockerImage, setDockerImage] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const form = useForm();

  const handleGpuSelect = (gpu: GpuOption) => {
    if (gpu.available) {
      setSelectedGpu(gpu);
      setShowConfigSection(true);
    }
  };

  const handleStartDeploy = async () => {
    if (!podName.trim()) {
      toast.error('El nombre del pod es obligatorio');
      return;
    }
    
    if (deploymentType === "docker" && !dockerImage.trim()) {
      toast.error('La imagen Docker es obligatoria');
      return;
    }
    
    if (deploymentType === "template" && !selectedTemplate) {
      toast.error('Debes seleccionar una plantilla');
      return;
    }
    
    if (!selectedGpu) {
      toast.error('Debes seleccionar una GPU');
      return;
    }
    
    if (!hasEnoughBalance) {
      toast.error('Saldo insuficiente para desplegar este pod');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Configurar los parámetros para la creación del pod según la interfaz definida
      const params: PodCreateParams = {
        name: podName,
        deploymentType: deploymentType,
        template: deploymentType === "template" && selectedTemplate ? selectedTemplate.id : undefined,
        dockerImage: deploymentType === "docker" ? dockerImage : 
                   (deploymentType === "template" && selectedTemplate ? selectedTemplate.dockerImage : undefined),
        gpu: selectedGpu.id,
        containerDiskSize,
        volumeDiskSize,
        ports,
        enableJupyter: useJupyter
        // No se especifica assignToUser ya que es un despliegue para el usuario actual
      };
      
      console.log('Enviando datos de creación de pod:', params);
      
      // Llamar al servicio para crear el pod
      const response = await podService.createPod(params);
      
      // Mostrar mensaje de éxito
      toast.success(`Pod ${podName} desplegado correctamente`);
      
      // Mostrar la URL generada para el subdominio
      if (response.url) {
        toast.info(`Pod accesible en: ${response.url}`);
      }
      
      // Redirigir a la página de pods
      navigate("/client/pods");
    } catch (error: any) {
      console.error('Error al desplegar pod:', error);
      
      // Mostrar el mensaje de error del servidor si está disponible
      if (error.response?.data?.message) {
        toast.error(`Error: ${error.response.data.message}`);
      } else {
        toast.error('Error al desplegar el pod. Por favor, intenta de nuevo.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate total cost
  const containerDiskPrice = 0.05 * containerDiskSize;
  const volumeDiskPrice = 0.1 * volumeDiskSize;
  const gpuPrice = selectedGpu?.price || 0;
  const totalPrice = gpuPrice + containerDiskPrice + volumeDiskPrice;

  // Check if user has enough balance
  const hasEnoughBalance = (user?.balance || 0) >= totalPrice;

  return (
    <DashboardLayout title="Desplegar Pod">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Desplegar Pod</h1>
          <p className="text-muted-foreground">Configura y despliega un nuevo pod con GPU</p>
        </div>
        
        <div className="text-sm text-right">
          <div className="text-muted-foreground">Saldo</div>
          <div className="font-semibold">{user?.balance?.toFixed(2) || 0} €</div>
        </div>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Selecciona una GPU</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {gpuOptions.map((gpu) => (
              <Card 
                key={gpu.id} 
                className={`cursor-pointer border-2 transition-all ${selectedGpu?.id === gpu.id ? 'border-primary' : 'border-border'} 
                          ${!gpu.available && 'opacity-60'}`}
                onClick={() => handleGpuSelect(gpu)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between">
                    {gpu.name}
                    {!gpu.available && (
                      <span className="text-xs bg-muted px-2 py-1 rounded-full">Próximamente</span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Precio</span>
                      <span className="font-medium">{gpu.price.toFixed(2)} €/hora</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">VRAM</span>
                      <span>{gpu.vram}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">CUDA Cores</span>
                      <span>{gpu.cores}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {showConfigSection && (
        <Form {...form}>
          <form className="space-y-8">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Configuración del Pod</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="podName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre del Pod</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Mi-Pod" 
                              value={podName} 
                              onChange={(e) => setPodName(e.target.value)} 
                            />
                          </FormControl>
                          <FormDescription>
                            Un nombre único para identificar tu pod
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                    
                    <div className="space-y-2">
                      <Label>Tipo de Despliegue</Label>
                      <Select 
                        value={deploymentType} 
                        onValueChange={setDeploymentType}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona tipo de despliegue" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="template">Template</SelectItem>
                          <SelectItem value="docker">Imagen Docker</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {deploymentType === "template" ? (
                      <div className="space-y-2">
                        <Label>Template</Label>
                        <TemplateSelector 
                          onSelectTemplate={(template) => {
                            setSelectedTemplate(template);
                            // Auto-fill form with template configuration
                            const allPorts = template.httpPorts.map(p => p.port.toString()).join(", ");
                            setPorts(allPorts);
                            setContainerDiskSize(template.containerDiskSize);
                            setVolumeDiskSize(template.volumeDiskSize);
                          }}
                          selectedTemplate={selectedTemplate}
                        />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label htmlFor="dockerImage">Imagen Docker</Label>
                        <Input 
                          id="dockerImage" 
                          value={dockerImage} 
                          onChange={(e) => setDockerImage(e.target.value)} 
                          placeholder="ej: nvidia/cuda:11.4.2-base-ubuntu20.04"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Especifica una imagen Docker para usar en tu pod
                        </p>
                      </div>
                    )}
                  
                    <div className="space-y-2">
                      <Label htmlFor="ports">Puertos (separados por comas)</Label>
                      <Input 
                        id="ports" 
                        value={ports} 
                        onChange={(e) => setPorts(e.target.value)} 
                        placeholder="8888, 7860"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2 pt-2">
                      <Checkbox 
                        id="jupyter" 
                        checked={useJupyter} 
                        onCheckedChange={(checked) => {
                          setUseJupyter(!!checked);
                          if (checked && !ports.includes("8888")) {
                            setPorts(ports ? `${ports}, 8888` : "8888");
                          }
                        }} 
                      />
                      <label
                        htmlFor="jupyter"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Usar Jupyter Lab (puerto 8888)
                      </label>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <Label className="flex items-center gap-2">
                        <HardDrive className="h-4 w-4" />
                        Container Disk (Archivos Temporales)
                      </Label>
                      <div className="flex justify-between">
                        <span className="text-sm">{containerDiskSize} GB</span>
                        <span className="text-sm text-muted-foreground">{(containerDiskPrice).toFixed(2)} €/hora</span>
                      </div>
                      <Slider
                        defaultValue={[containerDiskSize]}
                        max={50}
                        min={5}
                        step={5}
                        onValueChange={(val) => setContainerDiskSize(val[0])}
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <Label className="flex items-center gap-2">
                        <HardDrive className="h-4 w-4" />
                        Volume Disk (Datos Persistentes)
                      </Label>
                      <div className="flex justify-between">
                        <span className="text-sm">{volumeDiskSize} GB</span>
                        <span className="text-sm text-muted-foreground">{(volumeDiskPrice).toFixed(2)} €/hora</span>
                      </div>
                      <Slider
                        defaultValue={[volumeDiskSize]}
                        max={150}
                        min={10}
                        step={10}
                        onValueChange={(val) => setVolumeDiskSize(val[0])}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pricing Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>{selectedGpu?.name}</span>
                    <span>{selectedGpu?.price?.toFixed(2)} €/hora</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Container Disk ({containerDiskSize} GB)</span>
                    <span>{containerDiskPrice.toFixed(2)} €/hora</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Volume Disk ({volumeDiskSize} GB)</span>
                    <span>{volumeDiskPrice.toFixed(2)} €/hora</span>
                  </div>
                  <div className="pt-2 border-t border-border flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{totalPrice.toFixed(2)} €/hora</span>
                  </div>
                  
                  {!hasEnoughBalance && (
                    <div className="pt-2 text-destructive">
                      Saldo insuficiente. Necesitas al menos {totalPrice.toFixed(2)} € para desplegar este pod.
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Pod Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>GPU</span>
                    <span>{selectedGpu?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>VRAM</span>
                    <span>{selectedGpu?.vram}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Storage</span>
                    <span>{containerDiskSize + volumeDiskSize} GB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tipo</span>
                    <span className="capitalize">{deploymentType === "template" ? "Template" : "Docker"}</span>
                  </div>
                  {deploymentType === "template" && selectedTemplate && (
                    <div className="flex justify-between">
                      <span>Template</span>
                      <span>{selectedTemplate.name}</span>
                    </div>
                  )}
                  {deploymentType === "docker" && (
                    <div className="flex justify-between">
                      <span>Imagen</span>
                      <span className="text-sm break-all">{dockerImage}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div className="flex justify-end">
              <Button 
                type="button" 
                className="w-full md:w-auto" 
                size="lg" 
                onClick={handleStartDeploy}
                disabled={!podName.trim() || !hasEnoughBalance || (deploymentType === "docker" && !dockerImage.trim()) || isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Desplegando...
                  </div>
                ) : (
                  <>
                    <Server className="mr-2 h-4 w-4" />
                    Start Deploy
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </DashboardLayout>
  );
};

export default ClientPodDeploy;