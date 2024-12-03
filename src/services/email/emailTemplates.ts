import { EmailTemplate } from './emailService';

export const repairStatusTemplate: EmailTemplate = {
  id: 'repair-status',
  name: 'Suivi de réparation',
  subject: 'Mise à jour de votre réparation - Ticket #{ticketId}',
  body: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Suivi de réparation</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      padding: 20px 0;
      border-bottom: 2px solid #f0f0f0;
    }
    .logo {
      width: 150px;
      height: auto;
      margin-bottom: 15px;
    }
    .title {
      color: #2563eb;
      font-size: 24px;
      font-weight: bold;
      margin: 0;
    }
    .ticket-info {
      background-color: #f8fafc;
      border-radius: 6px;
      padding: 15px;
      margin: 20px 0;
    }
    .status-badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 15px;
      font-size: 14px;
      font-weight: 500;
      background-color: #dbeafe;
      color: #1e40af;
    }
    .device-details {
      margin: 20px 0;
      padding: 15px;
      border-left: 4px solid #2563eb;
      background-color: #f8fafc;
    }
    .status-timeline {
      margin: 25px 0;
      padding: 0;
      list-style: none;
    }
    .timeline-item {
      position: relative;
      padding-left: 30px;
      margin-bottom: 15px;
    }
    .timeline-item:before {
      content: '';
      position: absolute;
      left: 0;
      top: 5px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background-color: #2563eb;
    }
    .timeline-item:after {
      content: '';
      position: absolute;
      left: 5px;
      top: 20px;
      width: 2px;
      height: calc(100% + 10px);
      background-color: #e5e7eb;
    }
    .timeline-item:last-child:after {
      display: none;
    }
    .footer {
      text-align: center;
      padding-top: 20px;
      border-top: 2px solid #f0f0f0;
      color: #6b7280;
      font-size: 14px;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #2563eb;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 500;
      margin-top: 20px;
    }
    .contact-info {
      margin-top: 20px;
      padding: 15px;
      background-color: #f8fafc;
      border-radius: 6px;
      font-size: 14px;
    }
    @media only screen and (max-width: 600px) {
      .container {
        padding: 15px;
      }
      .title {
        font-size: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="title">Suivi de votre réparation</h1>
      <p>Ticket #{ticketId}</p>
    </div>

    <div class="ticket-info">
      <p>Bonjour {clientName},</p>
      <p>Voici une mise à jour concernant la réparation de votre appareil :</p>
    </div>

    <div class="device-details">
      <p><strong>Appareil :</strong> {deviceBrand} {deviceModel}</p>
      <p><strong>Statut actuel :</strong> <span class="status-badge">{status}</span></p>
    </div>

    <div class="status-timeline">
      <div class="timeline-item">
        <p><strong>Réception</strong><br>
        Votre appareil a été reçu dans notre atelier</p>
      </div>
      <div class="timeline-item">
        <p><strong>Diagnostic</strong><br>
        {diagnosticDetails}</p>
      </div>
      <div class="timeline-item">
        <p><strong>Prochaine étape</strong><br>
        {nextStep}</p>
      </div>
    </div>

    <div class="contact-info">
      <p><strong>Besoin d'informations supplémentaires ?</strong></p>
      <p>N'hésitez pas à nous contacter :</p>
      <ul>
        <li>Par téléphone : 01 23 45 67 89</li>
        <li>Par email : support@techrepairpro.fr</li>
      </ul>
    </div>

    <div class="footer">
      <a href="{trackingUrl}" class="button">Suivre ma réparation en ligne</a>
      <p>Tech Repair Pro<br>
      123 Rue de la Réparation<br>
      75001 Paris</p>
    </div>
  </div>
</body>
</html>
`,
  variables: [
    'ticketId',
    'clientName',
    'deviceBrand',
    'deviceModel',
    'status',
    'diagnosticDetails',
    'nextStep',
    'trackingUrl'
  ]
};