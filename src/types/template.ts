export interface Template {
  id: string;
  name: string;
  dockerImage: string;
  ports: string;
  containerDiskSize: number;
  volumeDiskSize: number;
  description: string; // markdown
}

export type CreateTemplateParams = Omit<Template, 'id'>;
