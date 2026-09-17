// email.js
import nodemailer from "nodemailer";

/**
 * Envía un email usando Gmail SMTP
 *
 * @param {Object} options - Opciones del email
 * @param {string} options.sendTo - Destinatario del email
 * @param {string} options.title - Asunto del email
 * @param {number} options.personalCode - Código personal a enviar
 * @param {string} options.userName - Nombre del usuario
 * @param {string} options.user - Email remitente (default: justoneclick37@gmail.com)
 * @param {string} options.password - Contraseña de aplicación (default: gpae milb kxlm pdoq)
 * @returns {Promise<Object>} Información del email enviado
 *
 * @example
 * await sendEmail({
 *   sendTo: 'xavier53348@gmail.com',
 *   title: 'JustOneClick',
 *   personalCode: 45545454655,
 *   userName: 'name'
 * });
 */
export async function sendEmail({
  sendTo = "",
  title = "hi there!!!",
  personalCode = 123456,
  userName = "demo",
  user = "justoneclick37@gmail.com",
  password = "gpae milb kxlm pdoq",
} = {}) {
  const cssCode = `
    <style>
      .card {
        box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
        max-width: 300px;
        margin: auto;
        text-align: center;
        font-family: arial;
      }
      .title {
        color: grey;
        font-size: 18px;
      }
      button {
        border: none;
        outline: 0;
        display: inline-block;
        padding: 8px;
        color: white;
        background-color: #000;
        text-align: center;
        cursor: pointer;
        width: 100%;
        font-size: 18px;
      }
      .telegram_user {
        text-decoration: none;
        font-size: 32px;
        color: Teal;
      }
      button:hover, a:hover {
        opacity: 0.7;
      }
    </style>
  `;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
        ${cssCode}
      </head>
      <body>
        <h6 style="text-align:center;opacity: 0.2;">The MIT License ...</h6>
        <div class="card">
          <img src="https://i.ibb.co/5MF1CDy/image-search-1700584447540.png" alt="John" style="width:100%">
          <h1>${userName}</h1>
          <p class="title">Never share your personal code</p>
          <p><h2><b>${personalCode}</b></h2></p>
          <div style="margin: 24px 0;">
            <a href="https://t.me/JustOneClic_bot"><i class="telegram_user"><b> @JustOneClick</b></i></a>
          </div>
          <p><a href="https://t.me/JustOneClick_bot"></a><button>Contact</button></a></p>
        </div>
      </body>
      <footer>
        <h6 style="text-align:center;opacity: 0.2;">The most important way...</h6>
      </footer>
    </html>
  `;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: user,
      pass: password,
    },
  });

  const info = await transporter.sendMail({
    from: user,
    to: sendTo,
    subject: title,
    html: html,
  });

  console.log("✅ Message sent!", info.messageId);
  return info;
}

// ============================================================
// CLASE VERSIÓN (más completa)
// ============================================================

export class EmailService {
  /**
   * @param {Object} config - Configuración del servicio de email
   * @param {string} config.user - Email remitente
   * @param {string} config.password - Contraseña de aplicación
   */
  constructor(config = {}) {
    this.user = config.user || "justoneclick37@gmail.com";
    this.password = config.password || "gpae milb kxlm pdoq";
    this.transporter = null;
  }

  /**
   * Inicializa el transporter (lazy loading)
   */
  getTransporter() {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: this.user,
          pass: this.password,
        },
      });
    }
    return this.transporter;
  }

  /**
   * Envía un email
   */
  async send({
    sendTo = "",
    title = "hi there!!!",
    personalCode = 123456,
    userName = "demo",
    html = null,
  } = {}) {
    const cssCode = `
      <style>
        .card {
          box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
          max-width: 300px;
          margin: auto;
          text-align: center;
          font-family: arial;
        }
        .title { color: grey; font-size: 18px; }
        button {
          border: none; outline: 0; display: inline-block; padding: 8px;
          color: white; background-color: #000; text-align: center;
          cursor: pointer; width: 100%; font-size: 18px;
        }
        .telegram_user { text-decoration: none; font-size: 32px; color: Teal; }
        button:hover, a:hover { opacity: 0.7; }
      </style>
    `;

    const defaultHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
          ${cssCode}
        </head>
        <body>
          <div class="card">
            <img src="https://i.ibb.co/5MF1CDy/image-search-1700584447540.png" style="width:100%">
            <h1>${userName}</h1>
            <p class="title">Never share your personal code</p>
            <p><h2><b>${personalCode}</b></h2></p>
            <div style="margin: 24px 0;">
              <a href="https://t.me/JustOneClic_bot"><i class="telegram_user"><b> @JustOneClick</b></i></a>
            </div>
            <p><a href="https://t.me/JustOneClick_bot"><button>Contact</button></a></p>
          </div>
        </body>
      </html>
    `;

    const transporter = this.getTransporter();
    const info = await transporter.sendMail({
      from: this.user,
      to: sendTo,
      subject: title,
      html: html || defaultHtml,
    });

    console.log("✅ Message sent!", info.messageId);
    return info;
  }
}

// ============================================================
// EJEMPLO DE USO
// ============================================================

/*
// Forma 1: Función simple
import { sendEmail } from './email.js';

await sendEmail({
  sendTo: 'xavier53348@gmail.com',
  title: 'JustOneClick',
  personalCode: 45545454655,
  userName: 'name'
});

// Forma 2: Clase
import { EmailService } from './email.js';

const email = new EmailService({
  user: 'justoneclick37@gmail.com',
  password: 'gpae milb kxlm pdoq'
});

await email.send({
  sendTo: 'xavier53348@gmail.com',
  title: 'JustOneClick',
  personalCode: 45545454655,
  userName: 'name'
});

// Forma 3: Sin parámetros (usa defaults)
await sendEmail();
*/
