import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import logo from "../../assets/images/logo.png";
import axios from "axios";
import {
  Document,
  Page,
  Text,
  Image,
  View,
  StyleSheet,
  PDFViewer,
} from "@react-pdf/renderer";

// Define styles (similar to DiagnosisPDFViewer)
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    fontFamily: "Helvetica",
  },
  headerSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
    borderBottom: "1px solid #ddd",
  },
  headerSectionDivider: {
    width: "48%",
  },
  logoContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 10,
  },
  logo: {
    width: 50,
  },
  header: {
    fontSize: 20,
    textAlign: "start",
    marginBottom: 10,
    fontWeight: "bold",
  },
  subHeader: {
    fontSize: 12,
    textAlign: "right",
    marginBottom: 20,
  },
  reportText: {
    color: "rgb(107 114 128)",
  },
  mainSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },
  section: {
    width: "48%",
    backgroundColor: "#f5f5f5",
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
    border: "1px solid #ccc",
  },
  label: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  text: {
    marginBottom: 3,
  },
  tableSection: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottom: "1px solid #000",
    backgroundColor: "#000",
    padding: 5,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1px solid #ddd",
    padding: 5,
  },
  tableCellSNo: {
    width: "10%",
    textAlign: "center",
  },
  tableCellSNoHeader: {
    width: "10%",
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  tableCellPropertyNameHeader: {
    width: "45%",
    color: "#fff",
    fontWeight: "bold",
    textAlign: "left",
  },
  tableCellPropertyValueHeader: {
    width: "45%",
    color: "#fff",
    fontWeight: "bold",
    textAlign: "left",
  },
  tableCellPropertyName: {
    width: "45%",
    textAlign: "left",
  },
  tableCellPropertyValue: {
    width: "45%",
    textAlign: "left",
  },
});

const PrescriptionPDF = ({ prescription, medicines }) => {
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const prescriptionProperties = [
    {
      name: "High Blood Pressure",
      value: prescription.highBloodPressure || "N/A",
    },
    { name: "Food Allergies:", value: prescription.foodAllergies || "N/A" },
    { name: "Tendency Bleed:", value: prescription.tendencyBleed || "N/A" },
    { name: "Heart Disease:", value: prescription.heartDisease || "N/A" },
    { name: "Diabetic:", value: prescription.diabetic || "N/A" },
    { name: "Pulse Rate:", value: prescription.pulseRate || "N/A" },
    { name: "Temperature:", value: prescription.temperature || "N/A" },
    { name: "Accident::", value: prescription.accident || "N/A" },
    {
      name: "Added:",
      value:
        `${formatDate(prescription.addedT)} ${formatTime(
          prescription.addedT
        )}` || "N/A",
    },
    { name: "Surgery:", value: prescription.surgery || "N/A" },
    ...(prescription.gender === "Female"
      ? [
        {
          name: "Female Pregnancy:",
          value: prescription.femalePregnancy || "N/A",
        },
        {
          name: "Breast Feeding:",
          value: prescription.breastFeeding || "N/A",
        },
      ]
      : []),
    {
      name: "Current Medication:",
      value: prescription.currentMedication || "N/A",
    },
    { name: "Description:", value: prescription.description || "N/A" },
    { name: "Test:", value: prescription.test || "N/A" },
    { name: "Advice:", value: prescription.advice || "N/A" },
  ];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerSection}>
          <View style={styles.headerSectionDivider}>
            <Text style={styles.header}>PRESCRIPTION REPORT HMS</Text>
            <Text style={styles.reportText}>
              Report ID #{prescription.id || "N/A"}
            </Text>
          </View>
          <View style={styles.headerSectionDivider}>
            <View style={styles.logoContainer}>
              <Image style={styles.logo} src={logo} alt="Logo" />
            </View>
            <Text style={styles.subHeader}>{prescription.address1}</Text>
          </View>
        </View>

        <View style={styles.mainSection}>
          <View style={styles.section}>
            <Text style={styles.label}>Patient Details:</Text>
            <Text style={styles.text}>
              Patient: {prescription.patientFirstName || "N/A"}{" "}
              {prescription.patientLastName || "N/A"}
            </Text>
            <Text style={styles.text}>
              Email: {prescription.patientEmail || "N/A"}
            </Text>
            <Text style={styles.text}>
              Phone No: {prescription.phoneCountryCode}{" "}
              {prescription.phoneNumber}
            </Text>

            <Text style={styles.text}>
              Gender:
              {prescription.gender}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.text}>
              Report Date: {formatDate(prescription.created_at) || "N/A"}{" "}
              {formatTime(prescription.created_at) || "N/A"}
            </Text>
            <Text style={styles.text}>
              Doctor: {prescription.doctorFirstName || "N/A"}{" "}
              {prescription.doctorLastName || "N/A"}
            </Text>
            <Text style={styles.text}>
              Email: {prescription.doctorEmail || "N/A"}
            </Text>
            <Text style={styles.text}>
              Next Visit: {prescription.nextVisitNumber || "N/A"}{" "}
              {prescription.nextVisitDay || "N/A"}
            </Text>
          </View>
        </View>

        <View style={styles.tableSection}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableCellSNoHeader}>#</Text>
            <Text style={styles.tableCellPropertyNameHeader}>
              Physical Information Name
            </Text>
            <Text style={styles.tableCellPropertyValueHeader}>
              Physical Information Value
            </Text>
          </View>
          {prescriptionProperties.map((prop, index) => (
            <View key={`prop-${index}`} style={styles.tableRow}>
              <Text style={styles.tableCellSNo}>{index + 1}</Text>
              <Text style={styles.tableCellPropertyName}>{prop.name}</Text>
              <Text style={styles.tableCellPropertyValue}>{prop.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.tableSection}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableCellSNoHeader}>#</Text>
            <Text style={styles.tableCellPropertyNameHeader}>
              Medicine Name
            </Text>
            <Text style={styles.tableCellPropertyValueHeader}>Dosage</Text>
            <Text style={styles.tableCellPropertyValueHeader}>
              Dose Duration
            </Text>
            <Text style={styles.tableCellPropertyValueHeader}>Time</Text>
            <Text style={styles.tableCellPropertyValueHeader}>
              Dose Interval
            </Text>
            <Text style={styles.tableCellPropertyValueHeader}>Comment</Text>
          </View>
          {prescription.medicines && Array.isArray(prescription.medicines)
            ? prescription.medicines.map((med, index) => (
              <View key={`med-${index}`} style={styles.tableRow}>
                <Text style={styles.tableCellSNo}>{index + 1}</Text>
                <Text style={styles.tableCellPropertyName}>
                  {medicines.find((m) => m.id === parseInt(med.medicineId))
                    ?.name || "N/A"}
                </Text>
                <Text style={styles.tableCellPropertyValue}>
                  {med.dosage || "N/A"}
                </Text>
                <Text style={styles.tableCellPropertyValue}>
                  {med.doseDuration || "N/A"}
                </Text>
                <Text style={styles.tableCellPropertyValue}>
                  {med.time || "N/A"}
                </Text>
                <Text style={styles.tableCellPropertyValue}>
                  {med.doseInterval || "N/A"}
                </Text>
                <Text style={styles.tableCellPropertyValue}>
                  {med.comment || "N/A"}
                </Text>
              </View>
            ))
            : null}
        </View>
      </Page>
    </Document>
  );
};

const PrescriptionPDFViewer = () => {
  const { id } = useParams();
  const [prescription, setPrescription] = useState(null);
  const [medicines, setMedicines] = useState([]);

  useEffect(() => {
    const storedPrescription = sessionStorage.getItem("prescription");
    if (storedPrescription) {
      setPrescription(JSON.parse(storedPrescription));
      sessionStorage.removeItem("prescription");
    } else {
      const fetchPrescription = async () => {
        try {
          const res = await axios.get(
            `http://localhost:8080/api/prescriptions/${id}`
          );
          setPrescription(res.data);
        } catch (error) {
          console.error("Error fetching prescription:", error);
        }
      };
      fetchPrescription();
    }

    const fetchMedicines = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/medicines");
        setMedicines(res.data || []);
      } catch (error) {
        console.error("Error fetching medicines:", error);
        setMedicines([]);
      }
    };
    fetchMedicines();
  }, [id]);

  if (!prescription) {
    return <div>Loading...</div>;
  }

  return (
    <PDFViewer style={{ width: "100%", height: "100vh" }}>
      <PrescriptionPDF prescription={prescription} medicines={medicines} />
    </PDFViewer>
  );
};

export default PrescriptionPDFViewer;
