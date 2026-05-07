import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [incidents, setIncidents] = useState([]);
  const [stats, setStats] = useState({
    total_incidents: 0,
    total_loss: 0,
    open_cases: 0,
    high_risk_cases: 0,
  });

  const [formData, setFormData] = useState({
    store_location: "",
    incident_type: "Shoplifting",
    merchandise_category: "",
    estimated_loss: "",
    suspect_description: "",
    repeat_offender: "no",
    status: "Open",
    notes: "",
  });

  const fetchData = async () => {
    try {
      const incidentsResponse = await axios.get(`${API_URL}/incidents`);
      const statsResponse = await axios.get(`${API_URL}/stats`);

      setIncidents(incidentsResponse.data);
      setStats(statsResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      ...formData,
      estimated_loss: Number(formData.estimated_loss),
    };

    try {
      await axios.post(`${API_URL}/incidents`, payload);

      setFormData({
        store_location: "",
        incident_type: "Shoplifting",
        merchandise_category: "",
        estimated_loss: "",
        suspect_description: "",
        repeat_offender: "no",
        status: "Open",
        notes: "",
      });

      fetchData();
    } catch (error) {
      console.error("Error creating incident:", error);
      alert("Could not create incident. Make sure backend is running.");
    }
  };

  const chartData = incidents.map((incident) => ({
    name: incident.merchandise_category,
    loss: incident.estimated_loss,
    risk: incident.risk_score,
  }));

  const typeCounts = {};

  incidents.forEach((incident) => {
    if (!typeCounts[incident.incident_type]) {
      typeCounts[incident.incident_type] = 0;
    }
    typeCounts[incident.incident_type]++;
  });

  const typeChartData = Object.keys(typeCounts).map((key) => ({
    name: key,
    count: typeCounts[key],
  }));

  const exportReport = () => {
    const report = incidents
      .map(
        (i) => 
          `Store: ${i.store_location}\nType: ${i.incident_type}\nLoss: $${i.estimated_loss}\nRisk: ${i.risk_score}\n---`
      )
      .join("\n")

    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "incident_report.txt";
    a.click();
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Retail LP Intelligence Platform</h1>
          <p style={styles.subtitle}>
            Incident tracking, risk scoring, and loss prevention analytics.
          </p>
        </div>
      </header>

      <section style={styles.statsGrid}>
        <div style={styles.card}>
          <p style={styles.label}>Total Incidents</p>
          <h2 style={styles.stat}>{stats.total_incidents}</h2>
        </div>

        <div style={styles.card}>
          <p style={styles.label}>Total Loss</p>
          <h2 style={styles.stat}>${stats.total_loss.toFixed(2)}</h2>
        </div>

        <div style={styles.card}>
          <p style={styles.label}>Open Cases</p>
          <h2 style={styles.stat}>{stats.open_cases}</h2>
        </div>

        <div style={styles.card}>
          <p style={styles.label}>High Risk Cases</p>
          <h2 style={styles.stat}>{stats.high_risk_cases}</h2>
        </div>
      </section>

      <main style={styles.mainGrid}>
        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Create Incident Report</h2>

          <form onSubmit={handleSubmit} style={styles.form}>
            <input
              style={styles.input}
              name="store_location"
              placeholder="Store Location"
              value={formData.store_location}
              onChange={handleChange}
              required
            />

            <select
              style={styles.input}
              name="incident_type"
              value={formData.incident_type}
              onChange={handleChange}
            >
              <option>Shoplifting</option>
              <option>Repeat Shoplifting</option>
              <option>Organized Retail Crime</option>
              <option>Internal Theft</option>
              <option>Fraud</option>
              <option>Safety Incident</option>
            </select>

            <input
              style={styles.input}
              name="merchandise_category"
              placeholder="Merchandise Category"
              value={formData.merchandise_category}
              onChange={handleChange}
              required
            />

            <input
              style={styles.input}
              name="estimated_loss"
              placeholder="Estimated Loss"
              type="number"
              value={formData.estimated_loss}
              onChange={handleChange}
              required
            />

            <input
              style={styles.input}
              name="suspect_description"
              placeholder="Suspect Description"
              value={formData.suspect_description}
              onChange={handleChange}
            />

            <select
              style={styles.input}
              name="repeat_offender"
              value={formData.repeat_offender}
              onChange={handleChange}
            >
              <option value="no">Repeat Offender: No</option>
              <option value="yes">Repeat Offender: Yes</option>
            </select>

            <textarea
              style={styles.textarea}
              name="notes"
              placeholder="Case Notes"
              value={formData.notes}
              onChange={handleChange}
            />

            <button style={styles.button} type="submit">
              Submit Incident
            </button>
          </form>
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Loss & Risk Chart</h2>
          
          <h3 style={{ marginTop: "20px" }}>Incident Type Distribution</h3>

          <div style={{ width: "100%", height: 250}}>
            <ResponsiveContainer>
              <BarChart data={typeChartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="loss" />
                <Bar dataKey="risk" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </main>

      <section style={styles.card}>
        <h2 style={styles.sectionTitle}>Recent Incidents</h2>

        <button onClick={exportReport} style={styles.button}>
          Export Investigation Report
        </button>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Store</th>
                <th>Type</th>
                <th>Category</th>
                <th>Loss</th>
                <th>Repeat</th>
                <th>Status</th>
                <th>Risk</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((incident) => (
                <tr key={incident.id}>
                  <td>{incident.store_location}</td>
                  <td>{incident.incident_type}</td>
                  <td>{incident.merchandise_category}</td>
                  <td>${incident.estimated_loss.toFixed(2)}</td>
                  <td>{incident.repeat_offender}</td>
                  <td>{incident.status}</td>
                  <td
                    style={{
                      color:
                      incident.risk_score >= 70
                        ? "red"
                        : incident.risk_score >= 40
                        ? "orange"
                        : "lime",
                        frontWeight: "bold",  
                    }}
                  >
                    {incident.risk_score}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0f172a",
    color: "#e5e7eb",
    padding: "32px",
    fontFamily: "Arial, sans-serif",
  },
  header: {
    marginBottom: "24px",
  },
  title: {
    fontSize: "36px",
    margin: 0,
  },
  subtitle: {
    color: "#94a3b8",
    marginTop: "8px",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "16px",
    marginBottom: "24px",
  },
  card: {
    background: "#111827",
    border: "1px solid #1f2937",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
  },
  label: {
    color: "#94a3b8",
    margin: 0,
  },
  stat: {
    fontSize: "28px",
    marginTop: "8px",
  },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "24px",
    marginBottom: "24px",
  },
  sectionTitle: {
    marginTop: 0,
    marginBottom: "16px",
  },
  form: {
    display: "grid",
    gap: "12px",
  },
  input: {
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #374151",
    background: "#020617",
    color: "#e5e7eb",
  },
  textarea: {
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #374151",
    background: "#020617",
    color: "#e5e7eb",
    minHeight: "90px",
  },
  button: {
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    background: "#2563eb",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
  },
  tableWrapper: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
};

export default App;