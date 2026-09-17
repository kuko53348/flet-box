// pdf.js - PDF Generator module for FletBox
import puppeteer from 'puppeteer';
import { writeFile } from 'fs/promises';

/**
 * # PDF MODULE
 * - Generate PDFs from HTML
 * - Generate invoices and receipts
 * - Save or return PDF buffer
 *
 * @example
 * import { generatePDF, generateInvoice } from '@flet-box/pdf';
 *
 * // Generate PDF from HTML
 * const pdf = await generatePDF('<h1>Hello World</h1>');
 *
 * // Generate invoice
 * const invoice = await generateInvoice({
 *   number: 'INV-001',
 *   date: '2024-01-01',
 *   client: 'Juan Pérez',
 *   items: [{ description: 'Product', quantity: 2, price: 50 }],
 *   total: 100
 * });
 *
 * // Save to file
 * await savePDF(pdf, 'invoice.pdf');
 */

/**
 * Generate PDF from HTML
 * @param {string} html - HTML content
 * @param {Object} options - PDF options
 * @param {string} options.format - Page format (default: 'A4')
 * @param {string} options.margin - Page margin (default: '1cm')
 * @param {boolean} options.landscape - Landscape mode (default: false)
 * @param {boolean} options.printBackground - Print background (default: true)
 * @returns {Promise<Buffer>} PDF buffer
 */
export async function generatePDF(html, options = {}) {
  const {
    format = 'A4',
    margin = '1cm',
    landscape = false,
    printBackground = true,
    width,
    height,
  } = options;

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    // Set content
    await page.setContent(html, {
      waitUntil: 'networkidle0',
    });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format,
      margin,
      landscape,
      printBackground,
      width,
      height,
    });

    return Buffer.from(pdfBuffer);
  } catch (error) {
    console.error('PDF generation error:', error.message);
    throw error;
  } finally {
    if (browser) await browser.close();
  }
}

/**
 * Save PDF buffer to file
 * @param {Buffer} pdfBuffer - PDF data
 * @param {string} filePath - Output file path
 * @returns {Promise<void>}
 */
export async function savePDF(pdfBuffer, filePath) {
  await writeFile(filePath, pdfBuffer);
  console.log(`✅ PDF saved to: ${filePath}`);
}

/**
 * Generate an invoice PDF
 * @param {Object} data - Invoice data
 * @param {string} data.number - Invoice number
 * @param {string} data.date - Invoice date
 * @param {string} data.client - Client name
 * @param {Array} data.items - Invoice items
 * @param {number} data.total - Total amount
 * @param {string} data.currency - Currency (default: 'USD')
 * @param {string} data.company - Company name (default: 'My Company')
 * @param {string} data.companyLogo - Company logo URL
 * @returns {Promise<Buffer>} PDF buffer
 */
export async function generateInvoice(data) {
  const {
    number,
    date,
    client,
    items = [],
    total,
    currency = 'USD',
    company = 'My Company',
    companyLogo,
    notes = '',
  } = data;

  const itemsHtml = items.map((item, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${item.description}</td>
      <td>${item.quantity || 1}</td>
      <td>${currency} ${item.price || 0}</td>
      <td>${currency} ${(item.quantity || 1) * (item.price || 0)}</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: Arial, sans-serif; 
          padding: 40px;
          background: #fff;
          color: #333;
        }
        .header { 
          display: flex; 
          justify-content: space-between; 
          margin-bottom: 30px;
          border-bottom: 2px solid #333;
          padding-bottom: 20px;
        }
        .company { font-size: 24px; font-weight: bold; }
        .invoice-title { font-size: 28px; color: #555; }
        .info { display: flex; justify-content: space-between; margin-bottom: 20px; }
        .info div { line-height: 1.6; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background: #f5f5f5; text-align: left; padding: 10px; border: 1px solid #ddd; }
        td { padding: 10px; border: 1px solid #ddd; }
        .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; }
        .total span { font-size: 24px; color: #2e7d32; }
        .footer { margin-top: 40px; font-size: 12px; color: #999; border-top: 1px solid #ddd; padding-top: 20px; }
        .notes { margin-top: 20px; padding: 15px; background: #f9f9f9; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="company">${company}</div>
          ${companyLogo ? `<img src="${companyLogo}" style="height:50px;margin-top:5px;" />` : ''}
        </div>
        <div>
          <div class="invoice-title">INVOICE</div>
          <div style="font-size:14px;color:#666;">#${number}</div>
          <div style="font-size:14px;color:#666;">${date}</div>
        </div>
      </div>

      <div class="info">
        <div>
          <strong>Bill To:</strong><br>
          ${client.replace(/\n/g, '<br>')}
        </div>
        <div style="text-align:right;">
          <strong>Date:</strong> ${date}<br>
          <strong>Invoice #:</strong> ${number}
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Description</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div class="total">
        Total: <span>${currency} ${total}</span>
      </div>

      ${notes ? `<div class="notes">${notes}</div>` : ''}

      <div class="footer">
        Thank you for your business!<br>
        ${company} - All rights reserved.
      </div>
    </body>
    </html>
  `;

  return generatePDF(html);
}

/**
 * Generate a receipt PDF
 * @param {Object} data - Receipt data
 * @param {string} data.number - Receipt number
 * @param {string} data.date - Receipt date
 * @param {string} data.client - Client name
 * @param {Array} data.items - Receipt items
 * @param {number} data.total - Total amount
 * @param {string} data.currency - Currency (default: 'USD')
 * @param {string} data.company - Company name (default: 'My Company')
 * @param {string} data.paymentMethod - Payment method (default: 'Credit Card')
 * @param {string} data.transactionId - Transaction ID
 * @returns {Promise<Buffer>} PDF buffer
 */
export async function generateReceipt(data) {
  const {
    number,
    date,
    client,
    items = [],
    total,
    currency = 'USD',
    company = 'My Company',
    paymentMethod = 'Credit Card',
    transactionId,
  } = data;

  const itemsHtml = items.map((item, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${item.description}</td>
      <td>${item.quantity || 1}</td>
      <td>${currency} ${item.price || 0}</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: Arial, sans-serif; 
          padding: 30px;
          background: #fff;
          color: #333;
          max-width: 700px;
          margin: 0 auto;
        }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
        .company { font-size: 22px; font-weight: bold; }
        .receipt-title { font-size: 26px; color: #2e7d32; margin-top: 5px; }
        .info { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th { background: #f5f5f5; text-align: left; padding: 8px; border: 1px solid #ddd; font-size: 13px; }
        td { padding: 8px; border: 1px solid #ddd; font-size: 13px; }
        .total { text-align: right; font-size: 16px; font-weight: bold; margin-top: 15px; }
        .total span { font-size: 20px; color: #2e7d32; }
        .payment { margin-top: 15px; font-size: 14px; color: #666; }
        .footer { margin-top: 30px; font-size: 12px; color: #999; text-align: center; border-top: 1px solid #ddd; padding-top: 20px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company">${company}</div>
        <div class="receipt-title">RECEIPT</div>
        <div style="font-size:14px;color:#666;">#${number}</div>
      </div>

      <div class="info">
        <div>
          <strong>Client:</strong><br>
          ${client.replace(/\n/g, '<br>')}
        </div>
        <div style="text-align:right;">
          <strong>Date:</strong> ${date}<br>
          ${transactionId ? `<strong>Transaction:</strong> ${transactionId}` : ''}
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Description</th>
            <th>Qty</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div class="total">
        Total Paid: <span>${currency} ${total}</span>
      </div>

      <div class="payment">
        <strong>Payment Method:</strong> ${paymentMethod}
      </div>

      <div class="footer">
        Thank you for your purchase!<br>
        ${company} - All rights reserved.
      </div>
    </body>
    </html>
  `;

  return generatePDF(html);
}

export default {
  generatePDF,
  savePDF,
  generateInvoice,
  generateReceipt,
};
