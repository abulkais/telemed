import React from "react";
import Dashboard from "./Components/Dashboard";
import Sidebar from "./Components/Sidebar";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DocumentsType from "./Components/Documents/DocumentsType";
import Documents from "./Components/Documents/Documents";
import BloodBanks from "./Components/BloodBanks/BloodBanks";
import BloodDonors from "./Components/BloodBanks/BloodDonors";
import BloodDonations from "./Components/BloodBanks/BloodDonations";
import BloodIssues from "./Components/BloodBanks/BloodIssues";
import Doctors from "./Components/Doctors/Doctors";
import DoctorsDepartments from "./Components/Doctors/DoctorsDepartments";
import Schedules from "./Components/Doctors/Schedules";
import HmoePage from "./Components/landingPage/HmoePage";
import DoctorHolidays from "./Components/Doctors/DoctorHolidays";
import DoctorsBreaks from "./Components/Doctors/DoctorsBreaks";
import BedTypes from "./Components/BedManagement/BedTypes";
import MedicinesCategories from "./Components/Medicines/MedicinesCategories";
import MedicineBrands from "./Components/Medicines/MedicineBrands";
import Medicnies from "./Components/Medicines/Medicnies";
import PurchaseMedicine from "./Components/Medicines/PurchaseMedicine";
import CreatePurchaseMedicine from "./Components/Medicines/CreatePurchaseMedicine";
import DiagnosisCategories from "./Components/Diagnosis/DiagnosisCategories";
import DiagnosisTests from "./Components/Diagnosis/DiagnosisTests";
import Services from "./Components/Services/Services";
import Ambulance from "./Components/Services/Ambulance";
import AmbulanceCalls from "./Components/Services/AmbulanceCalls";
import Packages from "./Components/Services/Packages";
import CreatePackage from "./Components/Services/CreatePackage";
import ViewPackage from "./Components/Services/ViewPackage";
import Insurances from "./Components/Services/Insurances";
import CreateInsurances from "./Components/Services/CreateInsurances";
import ViewInsurances from "./Components/Services/ViewInsurances";
import Vaccinations from "./Components/Vaccinations/Vaccinations";
import VaccinatedPatients from "./Components/Vaccinations/VaccinatedPatients";
import PathologyParameters from "./Components/Pathology/PathologyParameters";
import PathologyCategories from "./Components/Pathology/PathologyCategories";
import PathologyUnits from "./Components/Pathology/PathologyUnits";
import CreatePatients from "./Components/Patients/CreatePatients";
import Patients from "./Components/Patients/Patients";
import ViewPatients from "./Components/Patients/ViewPatients";
import CreateCases from "./Components/Patients/CreateCases";
import Cases from "./Components/Patients/Cases";
import CaseHandlers from "./Components/Patients/CaseHandlers";
import CreateCaseHandlers from "./Components/Patients/CreateCaseHandlers";
import ViewCaseHandler from "./Components/Patients/ViewCaseHandler";
import Beds from "./Components/BedManagement/Beds";
import BulkBeds from "./Components/BedManagement/BulkBeds";
import CreateDiagnosisTest from "./Components/Diagnosis/CreateDiagnosisTest";
import OperationsReports from "./Components/Reports/OperationsReports";
import InvestigationReports from "./Components/Reports/InvestigationReports";
import CreateInvestigationReport from "./Components/Reports/CreateInvestigationReport";
import DiagnosisPDFViewer from "./Components/Diagnosis/DiagnosisPDFViewer";
import DiagnosisTestDetails from "./Components/Diagnosis/DiagnosisTestDetails";
import DoctorOpdCharges from "./Components/HospitalCharges/DoctorOpdCharges";
import PatientAdmissions from "./Components/Patients/PatientAdmissions";
import CreatePatientAdmission from "./Components/Patients/CreatePatientAdmission";
import ViewPatientAdmission from "./Components/Patients/ViewPatientAdmission";
import IpdPatients from "./Components/IPDPatients/IPDPatients";
import CreateIpdPatient from "./Components/IPDPatients/CreateIpdPatient";
import ViewIpdPatient from "./Components/IPDPatients/ViewIpdPatient";
import Currencies from "./Components/Settings/Currencies";
import PatientSmartCards from "./Components/PatientSmartCards/PatientSmartCards";
import InventoriesCategories from "./Components/Inventories/InventoriesCategories";
import InventoriesItems from "./Components/Inventories/InventoriesItems";
import ItemStocks from "./Components/Inventories/ItemStocks";
import CreateItemStock from "./Components/Inventories/CreateItemStock";
import Admins from "./Components/Users/AdminPage";
import CreateEditAdmin from "./Components/Users/CreateEditAdmin";
import ViewAdmin from "./Components/Users/ViewAdmin";
import Accountants from "./Components/Users/Accountants";
import ViewAccountant from "./Components/Users/ViewAccountant";
import CreateAccountant from "./Components/Users/CreateAccountant";
import Nurses from "./Components/Users/Nurses";
import CreateNurse from "./Components/Users/CreateNurse";
import ViewNurse from "./Components/Users/ViewNurse";
import Receptionists from "./Components/Users/Receptionists";
import CreateReceptionist from "./Components/Users/CreateReceptionist";
import ViewReceptionist from "./Components/Users/ViewReceptionist";
import LabTechnicians from "./Components/Users/LabTechnicians";
import CreateLabTechnician from "./Components/Users/CreateLabTechnician";
import ViewLabTechnician from "./Components/Users/ViewLabTechnician";
import Pharmacists from "./Components/Users/Pharmacists";
import CreatePharmacist from "./Components/Users/CreatePharmacist";
import ViewPharmacist from "./Components/Users/ViewPharmacist";
import ViewOpdPatient from "./Components/OPDPatients/ViewOpdPatient";
import CreateOpdPatient from "./Components/OPDPatients/CreateOpdPatient";
import OpdPatients from "./Components/OPDPatients/OpdPatient";
import FinanceCategories from "./Components/Finance/ExpensesCategories";
import Income from "./Components/Finance/Income";
import Expenses from "./Components/Finance/Expenses";
import Accounts from "./Components/Billing/Accounts";
import EmployeePayrolls from "./Components/Billing/EmployeePayrolls";
import CreatePayroll from "./Components/Billing/CreatePayroll";
import PayrollView from "./Components/Billing/PayrollView";
import Invoices from "./Components/Billing/Invoices";
import CreateInvoice from "./Components/Billing/CreateInvoice";
import Payments from "./Components/Billing/Payments";
import PaymentReports from "./Components/Billing/PaymentReports";
import AdvancedPayments from "./Components/Billing/AdvancedPayments";
import DeathReports from "./Components/Reports/DeathReports";
import BirthReports from "./Components/Reports/BirthReports";
import IncomeCategories from "./Components/Finance/IncomeCategories";
import ExpensesCategories from "./Components/Finance/ExpensesCategories";
import Prescriptions from "./Components/Prescriptions/Prescriptions";
import CreatePrescription from "./Components/Prescriptions/CreatePrescription";
import PrescriptionPDFViewer from "./Components/Prescriptions/PrescriptionPDFViewer";
import ViewPrescription from "./Components/Prescriptions/ViewPrescription";
import BedAssign from "./Components/BedManagement/BedAssign";

function App() {
  return (
    <>
      <Router>
        <div className="app-container">
          <Sidebar /> {/* Sidebar remains fixed for all pages */}
          <div className="main-content">
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />

              <Route path="/documnets-types" element={<DocumentsType />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/blood-banks" element={<BloodBanks />} />
              <Route path="/blood-donors" element={<BloodDonors />} />
              <Route path="/blood-donations" element={<BloodDonations />} />
              <Route path="/blood-issues" element={<BloodIssues />} />
              <Route path="/doctors" element={<Doctors />} />
              <Route
                path="/doctor-departments"
                element={<DoctorsDepartments />}
              />
              <Route path="/schedules" element={<Schedules />} />
              <Route path="/home" element={<HmoePage />} />
              <Route path="/doctors-holidays" element={<DoctorHolidays />} />
              <Route path="/doctors-breaks" element={<DoctorsBreaks />} />

              <Route path="/bed-types" element={<BedTypes />} />
              <Route path="/bed-assigns" element={<BedAssign />} />
              <Route
                path="/medicnies-categories"
                element={<MedicinesCategories />}
              />
              <Route path="/medicine-brands" element={<MedicineBrands />} />
              <Route path="/medicine" element={<Medicnies />} />
              <Route path="/purchase-medicine" element={<PurchaseMedicine />} />
              <Route
                path="/purchase-medicine/create"
                element={<CreatePurchaseMedicine />}
              />

              <Route path="/services" element={<Services />} />
              <Route path="/ambulances" element={<Ambulance />} />
              <Route path="/ambulance-calls" element={<AmbulanceCalls />} />

              <Route path="/packages" element={<Packages />} />
              <Route path="/packages/create" element={<CreatePackage />} />
              <Route path="/packages/:id/edit" element={<CreatePackage />} />
              <Route path="/packages/:id/view" element={<ViewPackage />} />

              <Route path="/insurances" element={<Insurances />} />
              <Route path="/insurances/create" element={<CreateInsurances />} />
              <Route
                path="/insurances/:id/edit"
                element={<CreateInsurances />}
              />
              <Route path="/insurances/:id/view" element={<ViewInsurances />} />

              <Route path="/vaccinations" element={<Vaccinations />} />
              <Route
                path="/vaccinated-patients"
                element={<VaccinatedPatients />}
              />

              <Route
                path="/pathology-parameters"
                element={<PathologyParameters />}
              />
              <Route
                path="/pathology-categories"
                element={<PathologyCategories />}
              />
              <Route path="/pathology-units" element={<PathologyUnits />} />

              <Route path="/patients" element={<Patients />} />
              <Route path="/patients/create" element={<CreatePatients />} />
              <Route path="/patients/:id/edit" element={<CreatePatients />} />
              <Route path="/patients/:id/view" element={<ViewPatients />} />
              <Route path="/cases" element={<Cases />} />
              <Route path="/cases/create" element={<CreateCases />} />
              <Route path="/cases/:id/edit" element={<CreateCases />} />
              <Route path="/case-handlers" element={<CaseHandlers />} />
              <Route
                path="/case-handlers/create"
                element={<CreateCaseHandlers />}
              />
              <Route
                path="/case-handlers/:id/edit"
                element={<CreateCaseHandlers />}
              />
              <Route
                path="/case-handlers/:id/view"
                element={<ViewCaseHandler />}
              />
              <Route
                path="/patient-admissions"
                element={<PatientAdmissions />}
              />
              <Route
                path="/patient-admissions/create"
                element={<CreatePatientAdmission />}
              />
              <Route
                path="/patient-admissions/:id/edit"
                element={<CreatePatientAdmission />}
              />
              <Route
                path="/patient-admissions/:id/view"
                element={<ViewPatientAdmission />}
              />

              <Route path="/beds" element={<Beds />} />
              <Route path="/bulk-beds" element={<BulkBeds />} />

              <Route
                path="/diagnosis-tests/create"
                element={<CreateDiagnosisTest />}
              />
              <Route
                path="/diagnosis-tests/:id/edit"
                element={<CreateDiagnosisTest />}
              />
              <Route
                path="/diagnosis-tests/:id/details"
                element={<DiagnosisTestDetails />}
              />
              <Route
                path="/diagnosis-categories"
                element={<DiagnosisCategories />}
              />
              <Route path="/diagnosis-tests" element={<DiagnosisTests />} />
              <Route
                path="/diagnosis-tests/:id/pdf"
                element={<DiagnosisPDFViewer />}
              />

              <Route
                path="/operation-reports"
                element={<OperationsReports />}
              />
              <Route
                path="/investigation-reports"
                element={<InvestigationReports />}
              />
              <Route
                path="/investigation-reports/create"
                element={<CreateInvestigationReport />}
              />
              <Route
                path="/investigation-reports/:id/edit"
                element={<CreateInvestigationReport />}
              />
              <Route
                path="/doctor-opd-charges"
                element={<DoctorOpdCharges />}
              />

              <Route path="/ipd-patients" element={<IpdPatients />} />
              <Route
                path="/ipd-patients/create"
                element={<CreateIpdPatient />}
              />
              <Route
                path="/ipd-patients/:id/edit"
                element={<CreateIpdPatient />}
              />
              <Route
                path="/ipd-patients/:id/view"
                element={<ViewIpdPatient />}
              />

              <Route path="/currencies-settings" element={<Currencies />} />
              <Route
                path="/generate-patient-smart-cards"
                element={<PatientSmartCards />}
              />

              <Route
                path="/inventories-categories"
                element={<InventoriesCategories />}
              />
              <Route path="/items" element={<InventoriesItems />} />
              <Route path="/item-stocks" element={<ItemStocks />} />
              <Route path="/item-stocks/create" element={<CreateItemStock />} />
              <Route
                path="/item-stocks/:id/edit"
                element={<CreateItemStock />}
              />

              <Route path="/admin" element={<Admins />} />
              <Route path="/admin/create" element={<CreateEditAdmin />} />
              <Route path="/admin/:id/edit" element={<CreateEditAdmin />} />
              <Route path="/admin/:id/view" element={<ViewAdmin />} />
              <Route path="/accountants" element={<Accountants />} />
              <Route
                path="/accountants/create"
                element={<CreateAccountant />}
              />
              <Route
                path="/accountants/:id/edit"
                element={<CreateAccountant />}
              />
              <Route
                path="/accountants/:id/view"
                element={<ViewAccountant />}
              />
              <Route path="/nurses" element={<Nurses />} />
              <Route path="/nurses/create" element={<CreateNurse />} />
              <Route path="/nurses/:id/edit" element={<CreateNurse />} />
              <Route path="/nurses/:id/view" element={<ViewNurse />} />
              <Route path="/receptionists" element={<Receptionists />} />
              <Route
                path="/receptionists/create"
                element={<CreateReceptionist />}
              />
              <Route
                path="/receptionists/:id/edit"
                element={<CreateReceptionist />}
              />
              <Route
                path="/receptionists/:id/view"
                element={<ViewReceptionist />}
              />
              <Route path="/lab-technicians" element={<LabTechnicians />} />
              <Route
                path="/lab-technicians/create"
                element={<CreateLabTechnician />}
              />
              <Route
                path="/lab-technicians/:id/edit"
                element={<CreateLabTechnician />}
              />
              <Route
                path="/lab-technicians/:id/view"
                element={<ViewLabTechnician />}
              />
              <Route path="/pharmacists" element={<Pharmacists />} />
              <Route
                path="/pharmacists/create"
                element={<CreatePharmacist />}
              />
              <Route
                path="/pharmacists/:id/edit"
                element={<CreatePharmacist />}
              />
              <Route
                path="/pharmacists/:id/view"
                element={<ViewPharmacist />}
              />
              <Route path="/opd-patients" element={<OpdPatients />} />
              <Route
                path="/opd-patients/:id/view"
                element={<ViewOpdPatient />}
              />
              <Route
                path="/opd-patients/create"
                element={<CreateOpdPatient />}
              />

              <Route
                path="/opd-patients/:id/edit"
                element={<CreateOpdPatient />}
              />

              <Route
                path="/expenses-categories"
                element={<ExpensesCategories />}
              />
              <Route path="/income-categories" element={<IncomeCategories />} />

              <Route path="/income" element={<Income />} />
              <Route path="/expenses" element={<Expenses />} />

              <Route path="/account" element={<Accounts />} />

              <Route path="/employee-payrolls" element={<EmployeePayrolls />} />
              <Route
                path="/employee-payrolls/create"
                element={<CreatePayroll />}
              />
              <Route
                path="/employee-payrolls/edit/:id"
                element={<CreatePayroll />}
              />
              <Route
                path="/employee-payrolls/view/:id"
                element={<PayrollView />}
              />

              <Route path="/invoices" element={<Invoices />} />
              <Route path="/invoices/create" element={<CreateInvoice />} />
              <Route path="/invoices/edit/:id" element={<CreateInvoice />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/payment-reports" element={<PaymentReports />} />
              <Route path="/advanced-payments" element={<AdvancedPayments />} />

              <Route path="/death-reports" element={<DeathReports />} />
              <Route path="/birth-reports" element={<BirthReports />} />
              <Route path="/prescriptions" element={<Prescriptions />} />
              <Route
                path="/prescriptions/create"
                element={<CreatePrescription />}
              />
              <Route
                path="/prescriptions/:id/edit"
                element={<CreatePrescription />}
              />
              <Route
                path="/prescriptions/:id/pdf"
                element={<PrescriptionPDFViewer />}
              />
              <Route
                path="/prescriptions/:id/view"
                element={<ViewPrescription />}
              />
            </Routes>
          </div>
        </div>
      </Router>
    </>
  );
}
export default App;
