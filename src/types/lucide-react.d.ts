declare module 'lucide-react' {
  import { FC, SVGProps } from 'react';
  export interface IconProps extends SVGProps<SVGSVGElement> {
    size?: number | string;
    color?: string;
    strokeWidth?: number | string;
  }
  
  export type Icon = FC<IconProps>;
  
  export const Loader2: Icon;
  export const Download: Icon;
  // 如果使用其他图标，可以在这里继续添加
} 