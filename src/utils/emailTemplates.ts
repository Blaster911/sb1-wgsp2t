export const generateTicketUpdateEmail = (ticketId: string, status: string, clientName: string) => {
  const statusColors = {
    reception: '#3B82F6',
    diagnostic: '#8B5CF6',
    waiting_client: '#F59E0B',
    waiting_parts: '#F97316',
    completed: '#10B981'
  };

  const statusLabels = {
    reception: 'Réceptionné',
    diagnostic: 'En diagnostic',
    waiting_client: 'En attente de votre validation',
    waiting_parts: 'En attente de pièces',
    completed: 'Terminé'
  };

  const color = statusColors[status] || '#3B82F6';
  const label = statusLabels[status] || status;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Mise à jour de votre réparation</title>
      </head>
      <body style="
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        background-color: #f3f4f6;
      ">
        <div style="
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        ">
          <div style="
            background-color: white;
            border-radius: 12px;
            padding: 32px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          ">
            <div style="text-align: center; margin-bottom: 32px;">
              <img src="https://your-logo-url.com" alt="Logo" style="height: 40px;">
            </div>
            
            <h1 style="
              color: #111827;
              font-size: 24px;
              font-weight: 600;
              margin-bottom: 16px;
              text-align: center;
            ">
              Mise à jour de votre réparation
            </h1>

            <p style="
              color: #4b5563;
              font-size: 16px;
              line-height: 24px;
              margin-bottom: 24px;
              text-align: center;
            ">
              Bonjour ${clientName},
            </p>

            <div style="
              background-color: #f9fafb;
              border-radius: 8px;
              padding: 24px;
              margin-bottom: 24px;
              text-align: center;
            ">
              <p style="
                color: #374151;
                font-size: 16px;
                font-weight: 500;
                margin-bottom: 8px;
              ">
                Ticket #${ticketId}
              </p>
              
              <div style="
                display: inline-block;
                background-color: ${color}15;
                color: ${color};
                padding: 8px 16px;
                border-radius: 9999px;
                font-weight: 500;
                font-size: 14px;
              ">
                ${label}
              </div>
            </div>

            <p style="
              color: #4b5563;
              font-size: 16px;
              line-height: 24px;
              margin-bottom: 32px;
              text-align: center;
            ">
              Nous vous tiendrons informé de l'avancement de votre réparation.
            </p>

            <div style="text-align: center;">
              <a href="#" style="
                display: inline-block;
                background-color: ${color};
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                text-decoration: none;
                font-weight: 500;
                font-size: 16px;
              ">
                Suivre ma réparation
              </a>
            </div>
          </div>

          <div style="
            text-align: center;
            margin-top: 24px;
            color: #6b7280;
            font-size: 14px;
          ">
            <p style="margin-bottom: 8px;">
              Tech Repair Pro
            </p>
            <p style="margin: 0;">
              123 Rue de la Réparation, 75000 Paris
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
};