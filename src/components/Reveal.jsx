import { useReveal } from '../hooks/useReveal.js';

export default function Reveal({ as: Tag = 'div', className = '', children, ...props }) {
  const ref = useReveal();
  return (
    <Tag ref={ref} className={`revelar ${className}`} {...props}>
      {children}
    </Tag>
  );
}
