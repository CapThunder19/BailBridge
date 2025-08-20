import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export async function generateBail(caseDetails, lawyerName, eligible, sendPdf = false) {


  const doc = new jsPDF();

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(`District Court of ${caseDetails.court}`, 70, 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text("Formal Bail Request Submitted to Hon’ble Judge", 20, 30);

  
  autoTable(doc, {
    startY: 40,
    head: [["Case ID", caseDetails.caseNumber]],
    body: [
      ["Prisoner Name", caseDetails.name],
      ["Age", caseDetails.age || "N/A"],
      ["Prisoner ID", caseDetails.prisonerId || caseDetails._id || "N/A"],
      ["Court", caseDetails.court || "not specified"],
      ["Date of Arrest", caseDetails.dateOfArrest ? caseDetails.dateOfArrest.slice(0, 10) : "N/A"],
      ["Offense", caseDetails.sections || caseDetails.offense || ""],
      [
        "Bail Eligibility",
        eligible ? "Eligible (Criteria Met)" : "Not Eligible",
      ],
      ["Lawyer Submitting Request", lawyerName],
    ],
    styles: { fontSize: 11, cellPadding: 4 },
    headStyles: { fillColor: [60, 60, 60], textColor: [255, 255, 255] }, 
  });

  let y = doc.lastAutoTable.finalY + 15;

  doc.setFont("helvetica", "bold");
  doc.text("Lawyer Review Notes:", 20, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const reviewText = `The prisoner ${caseDetails.name} has served ${caseDetails.timeServedDays} days in custody. This is his first offense and he has shown good conduct during trial. As per Section 437 CrPC, bail may be considered since the offense is non-heinous and the accused fulfills the eligibility criteria.`;
  doc.text(reviewText, 20, y, { maxWidth: 170, align: "justify" });

  y += 40;
  doc.text("Respectfully Submitted,", 20, y);
  y += 15;
  doc.text("_______________________", 20, y);
  y += 7;
  doc.text(`Adv. ${lawyerName} (Defense Lawyer)`, 20, y);

  
  y += 20;
  doc.setFont("helvetica", "bold");
  doc.text("Judge’s Order:", 20, y);

  const boxY = y + 12;
  const boxSize = 5;

  doc.rect(25, boxY, boxSize, boxSize); 
  doc.setFont("helvetica", "normal");
  doc.text("Bail Granted", 33, boxY + boxSize - 1);
  
  doc.rect(80, boxY, boxSize, boxSize); 
  doc.text("Bail Rejected", 88, boxY + boxSize - 1);

  y = boxY + boxSize + 15;
  doc.text("_______________________", 20, y);
  y += 4;
  doc.text("Hon’ble Judge Signature & Seal", 20, y);

  
  if (sendPdf) {
    doc.save("bail_application.pdf");
  }

  return doc;
}