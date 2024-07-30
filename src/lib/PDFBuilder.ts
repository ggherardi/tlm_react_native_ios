import { Utility } from './Utility';
import { Bootstrap } from './Bootstrap';
import { BusinessEvent } from './models/BusinessEvent';
import { ExpenseReport } from './models/ExpenseReport';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import { Constants } from './Constants';
import dataContext from './models/DataContext';
import { Images } from '../assets/Images';

export const PDFBuilder = {
  createExpensesPdfAsync: async (event: BusinessEvent, directoryName: string, fileName: string): Promise<RNHTMLtoPDF.Pdf> => {
    return new Promise(async (resolve, reject) => {
      const directory = `Documents/${directoryName}`;
      const expenses = dataContext.ExpenseReports ? dataContext.ExpenseReports.getAllData() : []
      const options = {
        html: PDFBuilder.generateHtml(event, expenses),
        fileName: fileName,
        directory: directory,
      };

      let file = await RNHTMLtoPDF.convert(options).catch(e => console.log("Error while creating pdf: ", e));
      if (file) {
        resolve(file);
      } else {
        reject(undefined);
      }
    });
  },

  generateHtml: (event: BusinessEvent, expenses: ExpenseReport[]): string => {
    const userProfile = Utility.GetUserProfile();
    let travelledKmsRefund = 0;
    const refundExpense = ExpenseReport.generateKmRefund(event);
    if (refundExpense.name == Constants.Generic.TravelRefundExpenseName) {
      expenses.push(refundExpense);
    }
    Utility.SortByDate(expenses, 'date', false);
    const totalAmount: number = Utility.CalculateTotalAmount(expenses, 'amount')
    let html = `
    <style>
      ${Bootstrap.style}
    
      .font-20 {
        font-size: 20px;
      }
      
      .bg-grey {
        background-color: #969696;
      }

      .tlm-image {
        max-width: 600px;
        max-heigth: 680px;
        align-self: center;
        justify-content: center;
      }

      @media print {
        .pagebreak { page-break-before: always; }
      }      
    </style>
    <div>            
      <img src='${Images.tlm_logo.base_64}' width="150" />
      <h1 class="text-center mt-5">NOTA SPESE</h1>
      
      <div class="text-right pt-3">        
        <span>Data:</span>
        <span>${Utility.FormatDateDDMMYYYY(new Date().toString())}</span>
      </div>      

      <div class="mt-4 mb-5 row border border-dark p-3">
        <div class="col-6">
          <span>Gruppo:</span>
          <span class="font-weight-bold">${event.name}</span>
        </div>        
        <div class="col-6">
          <span>Date evento:</span>
          <span class="font-weight-bold">${Utility.FormatDateDDMMYYYY(event.startDate)} - ${Utility.FormatDateDDMMYYYY(event.endDate)}</span>
        </div>
      </div>

      <div class="my-5 row border-bottom">
        <div class="col-6">
          <span>Hostess/Tour Leader:</span>
          <span class="font-weight-bold">${userProfile.name} ${userProfile.surname}</span>
        </div>
        <div class="col-6">
          <span>Destinazione:</span>
          <span class="font-weight-bold">${event.city}</span>
        </div>
      </div>

      <div class="${event.needCarRefund ? '' : 'd-none'} border-bottom my-5">
        <div>
          <span>Località di partenza:</span>
          <span class="font-weight-bold">${event.refundStartingCity}</span>
        </div>
        <div>
          <span>Località di arrivo:</span>
          <span class="font-weight-bold">${event.refundArrivalCity}</span>
        </div>
        <div>
          <span>Totale KM percorsi:</span>
          <span class="font-weight-bold">${event.totalTravelledKms}</span>
        </div>
      </div>

      <table class="table">
        <thead>          
          <tr>
            <th>Data</th>
            <th>Tipo di spesa</th>
            <th>Note</th>
            <th class="text-right">Costo</th>
          </tr>
        </thead>
        <tbody>              
    `;

    // Main table
    for (let i = 0; i < expenses.length; i++) {
      const expense = expenses[i];
      html += `
          <tr>
            <td>${expense.date ? Utility.FormatDateDDMMYYYY(expense.date) : ''}</td>
            <td>${expense.name}</td>
            <td>${expense.description}</td>
            <td class="text-right">${expense.amount.toFixed(2)} ${event.mainCurrency.symbol}</td>
          </tr>
      `;
    }
    html += `
          <tr>
            <td></td>
            <td></td>
            <td>
              <div class="py-3 font-20 font-weight-bold">
                <span>TOTALE NOTA SPESE</span>
              </div>
            </td>
            <td>
              <div class="bg-warning py-3 font-20 font-weight-bold text-right pr-2">${totalAmount?.toFixed(2)} ${event.mainCurrency.symbol}</div>
            </td>
          </tr>
        </tbody>
      </table>`;

    // Cash fund table
    html += `
      <div class="mt-5 row">
        <div class="col-6">
          <table class="table table-striped">
            <tbody>
              <tr>
                <td>Totale nota spese</td>
                <td class="text-right">${totalAmount?.toFixed(2)} ${event.mainCurrency.symbol}</td>
                <td>-</td>
              </tr>
              <tr>
                <td>Fondo cassa ricevuto</td>
                <td class="text-right">${event.cashFund && Number(event.cashFund).toFixed(2)} ${event.mainCurrency.symbol}</td>
                <td>=</td>
              </tr>
              <tr class="border-bottom">
                <td>Totale dovuto al Tour Leader</td>
                <td class="text-right">${(totalAmount - Number(event.cashFund)).toFixed(2)} ${event.mainCurrency.symbol}</td>
                <td />
              </tr>
            </tbody>
          </table>   
        </div>
      </div>`;

    html += `
    </div>
    `;

    // GG: I know this is slower, but it's much more readable this way
    if (expenses.length && expenses[0].name == Constants.Generic.TravelRefundExpenseName) {
      expenses.shift();
    }
    for (let i = 0; i < expenses.length; i++) {
      const expense = expenses[i];
      const isEven = i % 2 == 0;
      const shouldPageBreak = i % 4 == 0;

      html += shouldPageBreak ? `
      <div class="pagebreak"></div>` : ``;
      html += isEven ? `
        <div class="row my-5">` : ``;
      html += `
          <div class="col-6 text-center">
            <span>Scontrino per la spesa:</span>
            <span>${expense.name} - ${Utility.FormatDateDDMMYYYY(expense.date)} - ${expense.amount} ${event.mainCurrency.symbol}</span>
            <div class="d-flex" style="height: 750px; justify-content: center;">
              <img class="tlm-image mt-5" src="file:///${expense.photoFilePath}">
            </div>              
          </div>`;
      html += !isEven ? `
        </div>` : ``;
    }  
    return html;
  },
}