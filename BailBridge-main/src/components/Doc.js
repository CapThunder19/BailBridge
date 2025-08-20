import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export function generateStyledPdf(caseDetails, lawyerName, geminiEligible) {
  const doc = new jsPDF();

  
  const isEligible =
    geminiEligible === true ||
    geminiEligible === "true" ||
    geminiEligible === 1;


  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Judicial Bail Review", 70, 15);

  
  autoTable(doc, {
    startY: 35,
    head: [["Case ID", caseDetails.caseNumber]],
    body: [
      ["Prisoner Name", caseDetails.name],
      ["Age", caseDetails.age || "N/A"],
      ["Prisoner ID", caseDetails._id || caseDetails.prisonerId || "N/A"],
      ["Date of Arrest", caseDetails.dateOfArrest ? caseDetails.dateOfArrest.slice(0, 10) : "N/A"],
      ["Offense", caseDetails.sections || "N/A"],
      [
        "Bail Eligibility",
        isEligible
          ? "Eligible for bail"
          : "Not eligible for bail"
      ],
    ],
    theme: "grid",
    styles: { fontSize: 11 },
    headStyles: { fillColor: [100, 100, 100] },
  });

  let y = doc.lastAutoTable.finalY + 10;

  y += 25;
  doc.setFont("helvetica", "bold");
  doc.text("Lawyer Review Notes:", 14, y);
  y += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(
    `The prisoner ${caseDetails.name} has served ${caseDetails.timeServedDays} days in custody. This is his first offense and he has shown good conduct during trial. As per Section 437 CrPC, bail may be considered since the offense is non-heinous and the accused fulfills the eligibility criteria.`,
    14,
    y,
    { maxWidth: 180 }
  );

 

  return doc;
}