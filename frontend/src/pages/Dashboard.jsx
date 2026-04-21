import { useEffect, useState } from "react";
import API from "../api";

function Dashboard() {
  const [student, setStudent] = useState({});
  const [password, setPassword] = useState({});
  const [course, setCourse] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const res = await API.get("/api/dashboard");
    setStudent(res.data.student);
  };

  const updatePassword = async (e) => {
    e.preventDefault();
    await API.put("/api/update-password", password);
    alert("Password updated");
  };

  const updateCourse = async () => {
    const res = await API.put("/api/update-course", { course });
    setStudent(res.data.student);
  };

  return (
    <div className="container mt-5">
      <h2>Dashboard</h2>

      <p>Name: {student.name}</p>
      <p>Email: {student.email}</p>
      <p>Course: {student.course}</p>

      <hr />

      <h4>Update Password</h4>
      <form onSubmit={updatePassword}>
        <input placeholder="Old Password"
          className="form-control my-2"
          onChange={(e) => setPassword({ ...password, oldPassword: e.target.value })} />

        <input placeholder="New Password"
          className="form-control my-2"
          onChange={(e) => setPassword({ ...password, newPassword: e.target.value })} />

        <button className="btn btn-warning">Update</button>
      </form>

      <hr />

      <h4>Update Course</h4>
      <input className="form-control my-2"
        onChange={(e) => setCourse(e.target.value)} />

      <button className="btn btn-info" onClick={updateCourse}>
        Update Course
      </button>
    </div>
  );
}

export default Dashboard;