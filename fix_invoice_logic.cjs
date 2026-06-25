const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const targetGetInvoiceNumber = `    invoices.forEach((inv) => {
      // Determine this invoice type
      let invType = "sale";
      if (inv.type) invType = inv.type;

      if (invType === typeKey && inv.invoiceNumber) {
        let numStr = String(inv.invoiceNumber);
        if (prefix && numStr.startsWith(prefix)) {
          numStr = numStr.substring(prefix.length);
        }
        const num = parseInt(numStr.replace(/\\D/g, ""), 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    });`;

const replacementGetInvoiceNumber = `    invoices.forEach((inv) => {
      // Determine this invoice type
      let invType = "sale";
      if (inv.type) invType = inv.type;

      if (invType === typeKey && inv.invoiceNumber) {
        let numStr = String(inv.invoiceNumber);
        if (numStr.startsWith("پیش‌نویس-")) {
          numStr = numStr.substring("پیش‌نویس-".length);
        }
        if (prefix && numStr.startsWith(prefix)) {
          numStr = numStr.substring(prefix.length);
        }
        const num = parseInt(numStr.replace(/\\D/g, ""), 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    });`;

code = code.replace(targetGetInvoiceNumber, replacementGetInvoiceNumber);

const targetFinalInvoiceNumber = `    const finalInvoiceNumber =
      (invoiceMode === "auto" && !autoSaveInvoiceId) ||
      String(invoiceNumber || "").startsWith("پیش‌نویس-") ||
      !invoiceNumber
        ? getInvoiceNumber(invoiceType)
        : invoiceNumber;`;

const replacementFinalInvoiceNumber = `    let finalInvoiceNumber = invoiceNumber;
    if ((invoiceMode === "auto" && !autoSaveInvoiceId && !editingInvoiceId) || !invoiceNumber) {
      finalInvoiceNumber = getInvoiceNumber(invoiceType);
    } else if (String(invoiceNumber || "").startsWith("پیش‌نویس-")) {
      finalInvoiceNumber = String(invoiceNumber || "").replace("پیش‌نویس-", "");
    }

    if (isDraft && !finalInvoiceNumber.startsWith("پیش‌نویس-")) {
      finalInvoiceNumber = "پیش‌نویس-" + finalInvoiceNumber;
    }`;

code = code.replace(targetFinalInvoiceNumber, replacementFinalInvoiceNumber);

const targetCustomPayload = `          invoiceNumber:
            customPayload.invoiceNumber &&
            (customPayload.invoiceNumber.includes("خودکار") ||
              customPayload.invoiceNumber.includes("تولید خودکار") ||
              customPayload.invoiceNumber.includes("پیش‌نویس"))
              ? getInvoiceNumber(customPayload.type)
              : customPayload.invoiceNumber ||
                getInvoiceNumber(customPayload.type),`;

const replacementCustomPayload = `          invoiceNumber: (function() {
            let num = customPayload.invoiceNumber || getInvoiceNumber(customPayload.type);
            if (num.includes("خودکار") || num.includes("تولید خودکار")) {
              num = getInvoiceNumber(customPayload.type);
            } else if (num.startsWith("پیش‌نویس-")) {
              num = num.replace("پیش‌نویس-", "");
            }
            if (isDraft && !num.startsWith("پیش‌نویس-")) {
              num = "پیش‌نویس-" + num;
            }
            return num;
          })(),`;

code = code.replace(targetCustomPayload, replacementCustomPayload);

fs.writeFileSync('src/App.tsx', code, 'utf-8');
console.log("Replaced logic.");
