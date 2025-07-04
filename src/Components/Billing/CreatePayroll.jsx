import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";
import "../../assets/Documents.css";

const CreatePayroll = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const [payrollData, setPayrollData] = useState({
    payrollId: "",
    role: "",
    employeeId: "",
    month: "",
    year: "",
    status: "Paid",
    basicSalary: "",
    allowance: "",
    deductions: "",
    netSalary: "",
    description: "",
  });
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedEmployeeName, setSelectedEmployeeName] = useState("");
  const [loading, setLoading] = useState(true);

  const generatePayrollId = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const [payrollId, setPayrollId] = useState(
    payrollData.payrollId ||
      (isEditMode ? payrollData.payrollId : generatePayrollId())
  );

  useEffect(() => {
    if (!isEditMode && !payrollData.payrollId) {
      setPayrollId(generatePayrollId());
    }
  }, [isEditMode, payrollData.payrollId]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await fetchEmployees();
        fetchRoles();
        if (isEditMode) await fetchPayroll();
      } catch (error) {
        console.error("Error in useEffect:", error);
        toast.error("Failed to load data. Check console for details.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isEditMode, id]);
  const fetchEmployees = async () => {
    try {
      const rolesList = [
        "doctors",
        "accountants",
        "nurses",
        "lab_technicians",
        "pharmacists",
        "receptionists",
      ];
      const employeeData = [];
      for (const role of rolesList) {
        console.log(`Fetching employees for role: ${role}`); // Debug log
        try {
          const res = await axios.get(`http://localhost:8080/api/${role}`, {
            timeout: 10000, // Increased timeout to 10 seconds
          });
          if (res.data && Array.isArray(res.data)) {
            employeeData.push(
              ...res.data.map((emp) => ({
                value: emp.id,
                label: `${emp.firstName || ""} ${emp.lastName || ""}`.trim(),
                role: role,
                image: emp.image || emp.imgUrl || null, // Handle both image and imgUrl
              }))
            );
          } else {
            console.warn(`No valid data for role ${role}:`, res.data);
          }
        } catch (roleError) {
          console.error(`Error fetching ${role}:`, roleError.message, roleError.response?.data, roleError.response?.status);
        }
      }
      setEmployees(employeeData);
      if (payrollData.role && employeeData.length > 0) {
        const availableEmployees = employeeData.filter((emp) => emp.role === payrollData.role);
        if (availableEmployees.length > 0) {
          setPayrollData((prev) => ({
            ...prev,
            employeeId: availableEmployees[0].value,
          }));
          setSelectedEmployeeName(availableEmployees[0].label);
        }
      }
    } catch (error) {
      console.error(
        "Error fetching employees:",
        error.message,
        error.response?.data,
        error.response?.status
      );
      toast.error("Failed to load employees. Check console for details.");
    }
  };
  // const fetchEmployees = async () => {
  //   try {
  //     const rolesList = [
  //       "doctors",
  //       "accountants",
  //       "nurses",
  //       "lab_technicians",
  //       "pharmacists",
  //       "receptionists",
  //     ];
  //     const employeeData = [];
  //     for (const role of rolesList) {
  //       console.log(`Fetching employees for role: ${role}`); // Debug log
  //       const res = await axios.get(`http://localhost:8080/api/${role}`, {
  //         timeout: 5000,
  //       });
  //       if (res.data && Array.isArray(res.data)) {
  //         employeeData.push(
  //           ...res.data.map((emp) => ({
  //             value: emp.id,
  //             label: `${emp.firstName || ""} ${emp.lastName || ""}`.trim(),
  //             role: role,
  //             image: emp.image || null,
  //           }))
  //         );
  //       } else {
  //         console.warn(`No valid data for role ${role}:`, res.data);
  //       }
  //     }
  //     setEmployees(employeeData);
  //     if (payrollData.role && employeeData.length > 0) {
  //       const availableEmployees = employeeData.filter(
  //         (emp) => emp.role === payrollData.role
  //       );
  //       if (availableEmployees.length > 0) {
  //         setPayrollData((prev) => ({
  //           ...prev,
  //           employeeId: availableEmployees[0].value,
  //         }));
  //         setSelectedEmployeeName(availableEmployees[0].label);
  //       }
  //     }
  //   } catch (error) {
  //     console.error(
  //       "Error fetching employees:",
  //       error.message,
  //       error.response?.data,
  //       error.response?.status
  //     );
  //     toast.error("Failed to load employees. Check console for details.");
  //   }
  // };
  const fetchRoles = () => {
    const rolesList = [
      "doctors",
      "accountants",
      "nurses",
      "lab_technicians",
      "pharmacists",
      "receptionists",
    ];
    setRoles(
      rolesList.map((role) => ({
        value: role,
        label: role.charAt(0).toUpperCase() + role.slice(1),
      }))
    );
  };

  const fetchPayroll = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/empPayrolls/${id}`
      );
      const payroll = res.data;
      setPayrollData({
        payrollId: payroll.payroll_id,
        role: payroll.role,
        employeeId: payroll.employee_id,
        month: payroll.month,
        year: payroll.year,
        status: payroll.status,
        basicSalary: payroll.basic_salary,
        allowance: payroll.allowance,
        deductions: payroll.deductions,
        netSalary: payroll.net_salary,
        description: payroll.description,
      });
      setPayrollId(payroll.payroll_id);
      setSelectedEmployeeName(payroll.employee_name || "");
    } catch (error) {
      console.error(
        "Error fetching payroll:",
        error.message,
        error.response?.data
      );
      toast.error("Failed to load payroll details.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedData = { ...payrollData, [name]: value };
    if (
      name === "basicSalary" ||
      name === "allowance" ||
      name === "deductions"
    ) {
      updatedData.netSalary =
        parseFloat(updatedData.basicSalary || 0) +
        parseFloat(updatedData.allowance || 0) -
        parseFloat(updatedData.deductions || 0);
    }
    setPayrollData(updatedData);
  };

  const handleRoleChange = (selectedOption) => {
    const newRole = selectedOption.value;
    setPayrollData((prev) => ({
      ...prev,
      role: newRole,
      employeeId: "",
    }));
    setSelectedEmployeeName("");
    const availableEmployees = employees.filter((emp) => emp.role === newRole);
    if (availableEmployees.length > 0) {
      const firstEmployee = availableEmployees[0];
      setPayrollData((prev) => ({ ...prev, employeeId: firstEmployee.value }));
      setSelectedEmployeeName(firstEmployee.label);
    }
    fetchEmployees();
  };

  const handleEmployeeChange = (selectedOption) => {
    const newEmployeeId = selectedOption.value;
    setPayrollData((prev) => ({
      ...prev,
      employeeId: newEmployeeId,
    }));
    const employee = employees.find(
      (emp) => emp.value === newEmployeeId && emp.role === payrollData.role
    );
    setSelectedEmployeeName(employee ? employee.label : "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !payrollData.role ||
      !payrollData.employeeId ||
      !payrollData.month ||
      !payrollData.year ||
      !payrollData.basicSalary
    ) {
      toast.error("All required fields must be filled");
      return;
    }
    try {
      await axios.post(`http://localhost:8080/api/empPayrolls`, {
        id: isEditMode ? id : null,
        payrollId: payrollId,
        ...payrollData,
      });
      toast.success(
        `${isEditMode ? "Updated" : "Created"} payroll successfully`
      );

      setTimeout(() => {
        navigate("/employee-payrolls");
      }, 2000);
    } catch (error) {
      console.error(
        "Error saving payroll:",
        error.message,
        error.response?.data
      );
      toast.error("Failed to save payroll");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container-fluid">
      <ToastContainer />
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h4">
          {isEditMode ? "Edit Employee Payroll" : "New Employee Payroll"}
        </h1>
        <button
          className="btn btn-primary px-4"
          onClick={() => navigate("/employee-payrolls")}
        >
          Back
        </button>
      </div>
      <div className="card p-4 border-0">
        <div className="row">
          <div className="form-group col-md-3">
            <label>
              Payroll ID: <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              name="payrollId"
              value={payrollId}
              className="form-control"
              readOnly
            />
          </div>
          <div className="form-group col-md-3">
            <label>
              Role: <span className="text-danger">*</span>
            </label>
            <Select
              options={roles}
              onChange={handleRoleChange}
              value={roles.find((role) => role.value === payrollData.role)}
              placeholder="Select Role"
            />
          </div>
          <div className="form-group col-md-3">
            <label>
              Employee: <span className="text-danger">*</span>
            </label>
            <Select
              options={employees.filter((emp) => emp.role === payrollData.role)}
              onChange={handleEmployeeChange}
              value={employees.find(
                (emp) =>
                  emp.value === payrollData.employeeId &&
                  emp.role === payrollData.role
              )}
              placeholder="Select Employee"
            />
          </div>

          <div className="form-group col-md-3">
            <label>
              Month: <span className="text-danger">*</span>
            </label>
            <select
              name="month"
              value={payrollData.month}
              className="form-control"
              onChange={handleInputChange}
            >
              <option value="">Select Month</option>
              {[
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
              ].map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group col-md-3">
            <label>
              Year: <span className="text-danger">*</span>
            </label>
            <input
              type="number"
              name="year"
              value={payrollData.year}
              className="form-control"
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group col-md-3">
            <label>
              Status: <span className="text-danger">*</span>
            </label>
            <select
              name="status"
              value={payrollData.status}
              className="form-control"
              onChange={handleInputChange}
            >
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
            </select>
          </div>
          <div className="form-group col-md-3">
            <label>
              Basic Salary: <span className="text-danger">*</span>
            </label>
            <input
              type="number"
              name="basicSalary"
              value={payrollData.basicSalary}
              className="form-control"
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group col-md-3">
            <label>Allowance:</label>
            <input
              type="number"
              name="allowance"
              value={payrollData.allowance}
              className="form-control"
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group col-md-3">
            <label>Deductions:</label>
            <input
              type="number"
              name="deductions"
              value={payrollData.deductions}
              className="form-control"
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group col-md-3">
            <label>Net Salary:</label>
            <input
              type="number"
              name="netSalary"
              value={payrollData.netSalary}
              className="form-control"
              readOnly
            />
          </div>

          <div className="form-group col-md-6">
            <label>Descriptions:</label>
            <textarea
              rows="2"
              placeholder="description"
              type="text"
              name="description"
              value={payrollData.description}
              className="form-control"
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className="d-flex justify-content-end mt-4">
          <button
            type="button"
            className="btn btn-primary mr-2 px-4"
            onClick={handleSubmit}
          >
            {isEditMode ? "Update" : "Save"}
          </button>
          <button
            type="button"
            className="btn btn-secondary px-4"
            onClick={() => navigate("/employee-payrolls")}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePayroll;
