
// export default DiagnosisPDFViewer;
import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
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

// Define styles
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
    justifyContent: "flex-end", // Aligns the logo to the right within its container
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

const DiagnosisPDF = ({ diagnosisTest }) => {
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

  // Define the diagnosis properties array for the table
  const diagnosisProperties = [
    { name: "Age", value: diagnosisTest.age },
    { name: "Height", value: diagnosisTest.height },
    { name: "Weight", value: diagnosisTest.weight },
    { name: "Average Glucose", value: diagnosisTest.averageGlucose },
    { name: "Fasting BloodSugar", value: diagnosisTest.fastingBloodSugar },
    { name: "Urine Sugar", value: diagnosisTest.urineSugar },
    { name: "Blood Pressure", value: diagnosisTest.bloodPressure },
    { name: "Diabetes", value: diagnosisTest.diabetes },
    { name: "Cholesterol", value: diagnosisTest.cholesterol },
    ...(diagnosisTest.properties || []).map((prop) => ({
      name: prop.propertyName,
      value: prop.propertyValue,
    })),
  ];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerSection}>
          <View style={styles.headerSectionDivider}>
            <Text style={styles.header}>
              PATIENT DIAGNOSIS TESTS REPORTS HMS
            </Text>
            <Text style={styles.reportText}>
              Report ID #{diagnosisTest.reportNumber}
            </Text>
          </View>
          <View style={styles.headerSectionDivider}>
            <View style={styles.logoContainer}>
              <Image style={styles.logo} src={logo} alt="Logo" />
            </View>
            <Text style={styles.subHeader}>
              C/303, Atlanta Shopping Mall Sudama Chowk, Mota Varachha, Surat,
              Gujarat 394101
            </Text>
          </View>
        </View>

        <View style={styles.mainSection}>
          <View style={styles.section}>
            neuropat<Text style={styles.label}>Patient Details:</Text>
            <Text style={styles.text}>
              Patient: {diagnosisTest.patientFirstName}{" "}
              {diagnosisTest.patientLastName}
            </Text>
            <Text style={styles.text}>Email: {diagnosisTest.patientEmail}</Text>
            <Text style={styles.text}>
              Phone No:{" "}
              {`${diagnosisTest.countryCode} ${diagnosisTest.patientPhone}`}
            </Text>
            <Text style={styles.text}>
              Gender: {diagnosisTest.patientGender}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.text}>
              Report Date: {formatDate(diagnosisTest.created_at)}{" "}
              {formatTime(diagnosisTest.created_at)}
            </Text>
            <Text style={styles.text}>
              Doctor: {diagnosisTest.doctorFirstName}{" "}
              {diagnosisTest.doctorLastName}
            </Text>
            <Text style={styles.text}>
              Diagnosis Category: {diagnosisTest.diagnosisCategoryName}
            </Text>
          </View>
        </View>

        <View style={styles.tableSection}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableCellSNoHeader}>#</Text>
            <Text style={styles.tableCellPropertyNameHeader}>
              Diagnosis Property Name
            </Text>
            <Text style={styles.tableCellPropertyValueHeader}>
              Diagnosis Property Value
            </Text>
          </View>
          {diagnosisProperties.map((prop, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCellSNo}>{index + 1}</Text>
              <Text style={styles.tableCellPropertyName}>{prop.name}</Text>
              <Text style={styles.tableCellPropertyValue}>
                {prop.value || "N/A"}
              </Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
};

const DiagnosisPDFViewer = () => {
  const location = useLocation();
  const { id } = useParams();
  const { diagnosisTest: initialDiagnosisTest } = location.state || {};
  const [diagnosisTest, setDiagnosisTest] = useState(initialDiagnosisTest);

  useEffect(() => {
    if (!diagnosisTest) {
      // Try to get diagnosisTest from sessionStorage
      const storedDiagnosisTest = sessionStorage.getItem("diagnosisTest");
      if (storedDiagnosisTest) {
        setDiagnosisTest(JSON.parse(storedDiagnosisTest));
        // Clean up sessionStorage after retrieving the data
        sessionStorage.removeItem("diagnosisTest");
      } else {
        // Fetch the diagnosis test data if not available in sessionStorage
        const fetchDiagnosisTest = async () => {
          try {
            const res = await axios.get(
              `http://localhost:8080/api/diagnosis-tests/${id}`
            );
            setDiagnosisTest(res.data);
          } catch (error) {
            console.error("Error fetching diagnosis test:", error);
          }
        };
        fetchDiagnosisTest();
      }
    }
  }, [diagnosisTest, id]);

  if (!diagnosisTest) {
    return <div>Loading...</div>;
  }

  return (
    <PDFViewer style={{ width: "100%", height: "100vh" }}>
      <DiagnosisPDF diagnosisTest={diagnosisTest} />
    </PDFViewer>
  );
};

export default DiagnosisPDFViewer;