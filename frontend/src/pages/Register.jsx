import { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    course: ""
  });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/api/register", form);
      alert("Registered Successfully");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input className="form-control my-2" placeholder="Name"
          onChange={(e) => setForm({ ...form, name: e.target.value })} />

        <input className="form-control my-2" placeholder="Email"
          onChange={(e) => setForm({ ...form, email: e.target.value })} />

        <input type="password" className="form-control my-2" placeholder="Password"
          onChange={(e) => setForm({ ...form, password: e.target.value })} />

        <input className="form-control my-2" placeholder="Course"
          onChange={(e) => setForm({ ...form, course: e.target.value })} />

        <button className="btn btn-primary">Register</button>
      </form>
    </div>
  );
}

export default Register;