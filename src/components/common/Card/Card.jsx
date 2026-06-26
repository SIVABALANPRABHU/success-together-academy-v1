import React from 'react';
import './Card.css';

const Card = ({
  children,
  title,
  subtitle,
  headerAction,
  footer,
  className = '',
  hover = false,
  padding = 'medium',
  ...props
}) => {
  const cardClasses = `
    card
    ${hover ? 'card--hover' : ''}
    card--padding-${padding}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={cardClasses} {...props}>
      {(title || subtitle || headerAction) && (
        <div className="card-header">
          <div className="card-header-content">
            {title && <h3 className="card-title">{title}</h3>}
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>
          {headerAction && <div className="card-header-action">{headerAction}</div>}
        </div>
      )}
      <div className="card-body">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
};

export default Card;

