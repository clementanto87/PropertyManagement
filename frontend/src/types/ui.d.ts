declare module '@/components/ui/textarea' {
  import { TextareaHTMLAttributes } from 'react';
  
  interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    // Add any additional props specific to your Textarea component
  }
  
  const Textarea: React.FC<TextareaProps>;
  export default Textarea;
}

declare module '@/components/ui/select' {
  import { SelectHTMLAttributes, ReactNode } from 'react';
  
  interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    // Add any additional props specific to your Select component
    children: ReactNode;
  }
  
  const Select: React.FC<SelectProps> & {
    Trigger: React.FC<{ children: ReactNode }>;
    Value: React.FC<{ children: ReactNode }>;
    Content: React.FC<{ children: ReactNode }>;
    Item: React.FC<{ value: string }>;
  };
  
  export { Select };
}
