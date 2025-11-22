declare module '@/components/ui/textarea' {
  import { TextareaHTMLAttributes } from 'react';

  interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    // Add any additional props specific to your Textarea component
  }

  const Textarea: React.FC<TextareaProps>;
  export default Textarea;
}
