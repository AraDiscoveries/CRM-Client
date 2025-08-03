import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { message } from "antd";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import { Table, Select, DatePicker, Button } from "antd";
import dayjs from "dayjs";
// import customParseFormat from "dayjs/plugin/customParseFormat";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";
import logo from "/logo.png";

import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);
// Extend dayjs with required plugins
dayjs.extend(customParseFormat);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const { Option } = Select;
const { RangePicker } = DatePicker;

const presetRanges = {
  "Last 7 Days": [dayjs().subtract(6, "day"), dayjs()],
  "Last 14 Days": [dayjs().subtract(13, "day"), dayjs()],
  "Last 30 Days": [dayjs().subtract(29, "day"), dayjs()],
  "This Month": [dayjs().startOf("month"), dayjs()],
};

const DetailClient = () => {
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);

  const { clientId } = useParams();
  const [leadData, setLeadData] = useState([]);
  const [allLeads, setAllLeads] = useState([]);
  const [sortOrder, setSortOrder] = useState("desc");
  const [dateRange, setDateRange] = useState(presetRanges["Last 7 Days"]);
  const [isTableView, setIsTableView] = useState(true);
  const [graphRange, setGraphRange] = useState("Last 3 Months");
  const [clientInfo, setClientInfo] = useState(null);
  const rangeStartMonth = dayjs(startDate).format("MMMM YYYY"); // e.g., April 2024
  const rangeEndMonth = dayjs(endDate).format("MMMM YYYY");
  const metaGraphCards = [
    {
      key: "metaFormLead",
      label: "Meta Form Leads",
      color: "#3b82f6",
    },
    {
      key: "metaWhatsappLead",
      label: "Meta WhatsApp Leads",
      color: "#10b981",
    },
    { key: "metaFund", label: "Meta Fund (₹)", color: "#0ea5e9" },
    {
      key: "totalMetaLeads",
      label: "Total Meta Leads",
      color: "#14b8a6",
    },
    { key: "metaCPL", label: "Meta CPL", color: "#8b5cf6" },
  ];

  const googleGraphCards = [
    {
      key: "googleWebsiteLead",
      label: "Google Website Leads",
      color: "#ef4444",
    },
    {
      key: "googleCallLead",
      label: "Google Call Leads",
      color: "#f59e0b",
    },
    { key: "googleFund", label: "Google Fund (₹)", color: "#f97316" },
    {
      key: "totalGoogleLeads",
      label: "Total Google Leads",
      color: "#22c55e",
    },
    { key: "googleCPL", label: "Google CPL", color: "#ec4899" },
  ];

  useEffect(() => {
    const fetchClientInfo = async () => {
      try {
        const res = await axios.get(
          `https://crm-server-f7bdb2fqa3adhjfp.eastasia-01.azurewebsites.net/api/clients/${clientId}`
        );
        setClientInfo(res.data); // Adjust if API wraps it inside a key
      } catch (err) {
        console.error("Error fetching client info:", err);
      }
    };

    if (clientId) {
      fetchClientInfo();
    }
  }, [clientId]);

  useEffect(() => {
    const fetchLeads = async () => {
      const response = await axios.get(
        "https://crm-server-f7bdb2fqa3adhjfp.eastasia-01.azurewebsites.net/api/leads/summary/all"
      );

      // Filter by client
      const clientLeads = response.data.filter(
        (lead) => lead.clientId?.toString() === clientId
      );

      setLeadData(clientLeads);
      setAllLeads(clientLeads);

      // Optionally grab clientName from first lead
      if (clientLeads.length > 0 && clientLeads[0].clientName) {
        setClientName(clientLeads[0].clientName);
      }
    };

    fetchLeads();
  }, [clientId]);

  const filteredData = leadData.filter((lead) => {
    return (
      dayjs(lead.date).isSameOrAfter(startDate) &&
      dayjs(lead.date).isSameOrBefore(endDate)
    );
  });

  const handlePDFExport = async () => {
    try {
      const pdf = new jsPDF("p", "mm", "a4");

      // 1️⃣ Fetch client info
      const clientRes = await axios.get(
        `https://crm-server-f7bdb2fqa3adhjfp.eastasia-01.azurewebsites.net/api/clients/${clientId}`
      );
      const client = clientRes.data;

      // 2️⃣ Add Logo to top-right
      const logoWidth = 40;
      const logoHeight = 15;
      pdf.addImage(logo, "PNG", 160, 10, logoWidth, logoHeight);

      // 3️⃣ Add Client Info (top-left)
      pdf.setFontSize(10);
      pdf.text(`Client Name: ${client.clientName}`, 10, 20);
      pdf.text(`Address: ${client.address ?? "N/A"}`, 10, 25);
      pdf.text(`GST No: ${client.gstNumber ?? "N/A"}`, 10, 30);

      // 4️⃣ Report Title Below Client Info
      const fromDate = dateRange[0]
        ? dayjs(dateRange[0]).format("DD/MM/YYYY")
        : "";
      const toDate = dateRange[1]
        ? dayjs(dateRange[1]).format("DD/MM/YYYY")
        : "";

      const reportTitle =
        fromDate && toDate
          ? `Campaign Report: ${fromDate} to ${toDate}`
          : `Campaign Report: ${dayjs().format("MMMM YYYY")}`;

      pdf.setFontSize(14);
      pdf.text(reportTitle, 10, 42); // Adjusted Y to sit below client info

      // 5️⃣ Prepare Table Data
      const tableHeader = [
        "Date",
        "Meta Form",
        "Meta WhatsApp",
        "Meta Fund",
        "Meta CPL",
        "Total MetaLeads",
        "Google Call",
        "Google Website",
        "Google Fund",
        "Google CPL",
        "Total GoogleLeads",
        "Total Leads",
      ];

      const formatNumber = (val: number | string) => {
        if (typeof val === "number") {
          return Number.isInteger(val) ? val.toString() : val.toFixed(2);
        }
        const num = parseFloat(val);
        return Number.isInteger(num) ? val : num.toFixed(2);
      };

      const tableBody = finalTableData.map((row) => [
        row.date,
        formatNumber(row.metaFormLead),
        formatNumber(row.metaWhatsappLead),
        formatNumber(row.metaFund),
        formatNumber(row.metaCpl),
        formatNumber(row.totalMetaLeads),
        formatNumber(row.googleCallLead),
        formatNumber(row.googleWebsiteLead),
        formatNumber(row.googleFund),
        formatNumber(row.googleCpl),
        formatNumber(row.totalGoogleLeads),
        formatNumber(row.totalLeads),
      ]);

      // 6️⃣ Render Table
      autoTable(pdf, {
        head: [tableHeader],
        body: tableBody,
        startY: 48, // Start below the report title
        styles: { fontSize: 8 },
        theme: "striped",
        margin: { top: 20, bottom: 20 },
        didParseCell: (data) => {
          if (data.row.index === finalTableData.length - 1) {
            data.cell.styles.fontStyle = "bold";
            data.cell.styles.fillColor = [240, 240, 240];
          }
        },
        didDrawPage: (data) => {
          pdf.setFontSize(10);
          pdf.text(
            `Page ${pdf.internal.getNumberOfPages()}`,
            200,
            290,
            null,
            null,
            "right"
          );
        },
      });

      // 7️⃣ Save It
      pdf.save("Lead_Report.pdf");
    } catch (err) {
      console.error("PDF export failed:", err);
      message.error("Failed to export PDF. Please try again.");
    }
  };

  const downloadGraphPDF = async () => {
    try {
      const pdf = new jsPDF("p", "mm", "a4");

      // 1. Fetch client info
      const clientRes = await axios.get(
        `https://crm-server-f7bdb2fqa3adhjfp.eastasia-01.azurewebsites.net/api/clients/${clientId}`
      );
      const client = clientRes.data;

      // 2. Screenshot the graph
      const chartElement = graphRef.current;
      if (!chartElement) return;

      const canvas = await html2canvas(chartElement, {
        scale: 2,
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth() - 20;
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

      // 3. Add logo to top-right
      const logoWidth = 40;
      const logoHeight = 15;
      pdf.addImage(logo, "PNG", 160, 10, logoWidth, logoHeight);

      // 4. Add client info (top-left)
      pdf.setFontSize(10);
      pdf.text(`Client Name: ${client.clientName}`, 10, 20);
      pdf.text(`Address: ${client.address ?? "N/A"}`, 10, 25);
      pdf.text(`GST No: ${client.gstNumber ?? "N/A"}`, 10, 30);

      // ➕ Add Month Range Below Title
      const leadMonths = filteredGraphLeads
        .map((entry) => dayjs(entry.date))
        .sort((a, b) => a.valueOf() - b.valueOf());

      const graphFromMonth = leadMonths.length
        ? leadMonths[0].format("MMMM YYYY")
        : "";
      const graphToMonth = leadMonths.length
        ? leadMonths[leadMonths.length - 1].format("MMMM YYYY")
        : "";

      const analysisRange = `Lead Analysis: ${graphFromMonth} to ${graphToMonth}`;
      pdf.setFontSize(11);
      pdf.text(analysisRange, 10, 52); // left aligned, adjust Y as needed

      // 6. Add graph slightly below the new text
      pdf.addImage(imgData, "PNG", 10, 60, pdfWidth, imgHeight);

      // 7. Save
      pdf.save("Lead_Analytics.pdf");
    } catch (error) {
      console.error("PDF generation error:", error);
      message.error("Failed to download PDF. Try again.");
    }
  };

  const handleExcelExport = () => {
    if (!finalTableData || finalTableData.length === 0) {
      console.warn("No data to export");
      return;
    }

    const formattedData = finalTableData.map((entry) => ({
      Date: entry.date,
      "Meta Form Leads": entry.metaFormLead,
      "Meta WhatsApp Leads": entry.metaWhatsappLead,
      "Meta Fund": entry.metaFund,
      "Meta CPL": entry.metaCpl,
      "Google Call Leads": entry.googleCallLead,
      "Google Website Leads": entry.googleWebsiteLead,
      "Google Fund": entry.googleFund,
      "Google CPL": entry.googleCpl,
      "Total Meta Leads": entry.totalMetaLeads,
      "Total Google Leads": entry.totalGoogleLeads,
      "Total Leads": entry.totalLeads,
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Lead Data");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "Lead_Report.xlsx");
  };

  const graphRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchLeads = async () => {
      const response = await axios.get(
        "https://crm-server-f7bdb2fqa3adhjfp.eastasia-01.azurewebsites.net/api/leads/summary/all"
      );

      // Only keep leads for this client
      const clientLeads = response.data.filter(
        (lead) => lead.clientId?.toString() === clientId
      );

      setLeadData(clientLeads);
    };
    fetchLeads();
  }, [clientId]);

  useEffect(() => {
    axios
      .get(
        "https://crm-server-f7bdb2fqa3adhjfp.eastasia-01.azurewebsites.net/api/leads/summary/all"
      )
      .then((res) => {
        const clientLeads = res.data.filter(
          (lead) => lead.clientId?.toString() === clientId
        );
        setAllLeads(clientLeads);
      });
  }, [clientId]);

  const tableData = allLeads
    .filter((entry) => {
      const entryDate = dayjs(entry.date);
      return (
        entryDate.isSameOrAfter(dateRange[0], "day") &&
        entryDate.isSameOrBefore(dateRange[1], "day")
      );
    })
    .map((entry, idx) => {
      const totalMetaLeads =
        (entry.metaFormLead || 0) + (entry.metaWhatsappLead || 0);
      const totalGoogleLeads =
        (entry.googleCallLead || 0) + (entry.googleWebsiteLead || 0);

      return {
        key: idx + 1,
        date: dayjs(entry.date).format("DD MMM YYYY"),
        metaFormLead: entry.metaFormLead || 0,
        metaWhatsappLead: entry.metaWhatsappLead || 0,
        metaFund: entry.metaFund || 0,
        metaCpl: entry.metaCpl || 0,
        googleCallLead: entry.googleCallLead || 0,
        googleWebsiteLead: entry.googleWebsiteLead || 0,
        googleFund: entry.googleFund || 0,
        googleCpl: entry.googleCpl || 0,
        totalMetaLeads,
        totalGoogleLeads,
        totalLeads: totalMetaLeads + totalGoogleLeads,
      };
    });

  const sortedData = [...tableData].sort((a, b) =>
    sortOrder === "asc"
      ? dayjs(a.date, "DD MMM YYYY").unix() -
        dayjs(b.date, "DD MMM YYYY").unix()
      : dayjs(b.date, "DD MMM YYYY").unix() -
        dayjs(a.date, "DD MMM YYYY").unix()
  );

  const columns = [
    { title: "Date", dataIndex: "date", key: "date" },
    {
      title: "Meta Form Leads",
      dataIndex: "metaFormLead",
      key: "metaFormLead",
    },
    {
      title: "Meta WhatsApp Leads",
      dataIndex: "metaWhatsappLead",
      key: "metaWhatsappLead",
    },
    {
      title: "Total Meta Leads",
      dataIndex: "totalMetaLeads",
      key: "totalMetaLeads",
    },
    { title: "Meta Fund", dataIndex: "metaFund", key: "metaFund" },
    { title: "Meta CPL", dataIndex: "metaCpl", key: "metaCpl" },
    {
      title: "Google Call Leads",
      dataIndex: "googleCallLead",
      key: "googleCallLead",
      className: "google-section-start",
    },
    {
      title: "Google Website Leads",
      dataIndex: "googleWebsiteLead",
      key: "googleWebsiteLead",
    },
    {
      title: "Total Google Leads",
      dataIndex: "totalGoogleLeads",
      key: "totalGoogleLeads",
    },
    { title: "Google Fund", dataIndex: "googleFund", key: "googleFund" },
    { title: "Google CPL", dataIndex: "googleCpl", key: "googleCpl" },
    { title: "Total Leads", dataIndex: "totalLeads", key: "totalLeads" },
  ];

  // const filteredGraphLeads = allLeads.filter((entry) => {
  //   const entryDate = dayjs(entry.date);
  //   return (
  //     entryDate.isSameOrAfter(dateRange[0], "day") &&
  //     entryDate.isSameOrBefore(dateRange[1], "day")
  //   );
  // });

  const totalsRow = {
    key: "total",
    date: "Total",
    metaFormLead: 0,
    metaWhatsappLead: 0,
    googleCallLead: 0,
    googleWebsiteLead: 0,
    metaFund: 0,
    googleFund: 0,
    metaCpl: 0,
    googleCpl: 0,
    totalMetaLeads: 0,
    totalGoogleLeads: 0,
    totalLeads: 0,
  };

  sortedData.forEach((row) => {
    totalsRow.metaFormLead += row.metaFormLead || 0;
    totalsRow.metaWhatsappLead += row.metaWhatsappLead || 0;
    totalsRow.metaFund += row.metaFund || 0;
    totalsRow.googleCallLead += row.googleCallLead || 0;
    totalsRow.googleWebsiteLead += row.googleWebsiteLead || 0;
    totalsRow.googleFund += row.googleFund || 0;

    totalsRow.totalMetaLeads += row.totalMetaLeads || 0;
    totalsRow.totalGoogleLeads += row.totalGoogleLeads || 0;
    totalsRow.totalLeads += row.totalLeads || 0;
  });

  // Custom CPL formulas
  const totalMetaLeads = totalsRow.metaFormLead + totalsRow.metaWhatsappLead;
  const totalGoogleLeads =
    totalsRow.googleCallLead + totalsRow.googleWebsiteLead;
  totalsRow.metaCpl =
    totalMetaLeads > 0 ? totalsRow.metaFund / totalMetaLeads : 0;
  totalsRow.googleCpl =
    totalGoogleLeads > 0 ? totalsRow.googleFund / totalGoogleLeads : 0;

  const finalTableData = [...sortedData, totalsRow];
  const [clientName, setClientName] = useState<string>("");

  const monthColors = {
    Jan: "#3b82f6", // Blue
    Feb: "#10b981", // Green
    Mar: "#f59e0b", // Orange
    Apr: "#ef4444", // Red
    May: "#8b5cf6", // Purple
    Jun: "#0ea5e9", // Sky
    Jul: "#f97316", // Amber
    Aug: "#22c55e", // Emerald
    Sep: "#eab308", // Yellow
    Oct: "#6366f1", // Indigo
    Nov: "#ec4899", // Pink
    Dec: "#14b8a6", // Teal
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            background: "#fff",
            border: "1px solid #ccc",
            padding: "8px",
            borderRadius: "5px",
          }}
        >
          <p style={{ margin: 0 }}>{label}</p>
          <p style={{ margin: 0 }}>
            <strong>Leads:</strong> {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  const getGraphStartDate = () => {
    const now = dayjs();
    switch (graphRange) {
      case "This Month":
        return now.startOf("month");
      case "Last 3 Months":
        return now.subtract(2, "month").startOf("month");
      case "Last 6 Months":
        return now.subtract(5, "month").startOf("month");
      case "Last 12 Months":
        return now.subtract(11, "month").startOf("month");
      default:
        return now.subtract(2, "month").startOf("month");
    }
  };

  const filteredGraphLeads = allLeads.filter((entry) => {
    const entryDate = dayjs(entry.date);
    return (
      entryDate.isSameOrAfter(getGraphStartDate(), "day") &&
      entryDate.isSameOrBefore(dayjs(), "day")
    );
  });

  return (
    <div className="p-6 grid grid-cols-1gap-10">
      {/* Filter Bar */}

      <div className="flex flex-wrap gap-4 items-center   mb-4">
        <Button type="primary" onClick={handleExcelExport}>
          Export Excel
        </Button>

        <Button type="default" onClick={handlePDFExport}>
          Export PDF
        </Button>
        <div className="flex gap-2 items-center">
          <RangePicker
            value={dateRange}
            onChange={(val) => setDateRange(val)}
            allowClear={false}
          />
          <Select
            placeholder="Presets"
            onChange={(val) => setDateRange(presetRanges[val])}
            style={{ width: 160 }}
          >
            {Object.keys(presetRanges).map((key) => (
              <Option key={key} value={key}>
                {key}
              </Option>
            ))}
          </Select>
        </div>
      </div>

      {/* Table */}
      <div id="table-section">
        <h2 className="text-xl font-bold mb-4">
          Detailed Daily Leads Table {clientName ? ` – ${clientName}` : ""}
        </h2>
        {/* <Table
          columns={columns}
          dataSource={sortedData}
          pagination={{ pageSize: 10 }}
          bordered
          scroll={{ x: "max-content" }}
        /> */}
        <Table
          columns={columns}
          dataSource={finalTableData}
          pagination={{ pageSize: 10 }}
          bordered
          scroll={{ x: "max-content" }}
        />
      </div>

      <div className="flex justify-end items-center gap-4">
        <Select
          defaultValue="Last 3 Months"
          style={{ width: 180 }}
          onChange={(val) => setGraphRange(val)}
        >
          <Option value="This Month">This Month</Option>
          <Option value="Last 3 Months">Last 3 Months</Option>
          <Option value="Last 6 Months">Last 6 Months</Option>
          <Option value="Last 12 Months">Last 12 Months</Option>
        </Select>
        <Button type="primary" onClick={downloadGraphPDF}>
          Download PDF Report
        </Button>
      </div>
      <div ref={graphRef} id="chart-section" className="space-y-6">
        {/* Right-side Controls */}

        {/* <h2 className="text-xl font-semibold">Lead Analytics</h2> */}

        {/* Top Control Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Month Color Legend */}
          <div className="flex flex-wrap gap-4">
            {Object.entries(monthColors).map(([month, color]) => (
              <div key={month} className="flex items-center gap-2">
                <span
                  style={{
                    backgroundColor: color,
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    display: "inline-block",
                  }}
                />
                <span className="text-sm font-medium">{month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Graph Grid */}
        <div className="overflow-x-auto">
          {/* Meta Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 min-w-[1400px]">
            {metaGraphCards.map(({ key, label, color }) => {
              const graphData = {};

              filteredGraphLeads.forEach((entry) => {
                const month = dayjs(entry.date).format("MMM YYYY");
                if (!graphData[month]) {
                  graphData[month] = { month, value: 0, fund: 0, leads: 0 };
                }

                if (key === "metaCPL") {
                  const leads =
                    (entry.metaFormLead || 0) + (entry.metaWhatsappLead || 0);
                  graphData[month].fund += entry.metaFund || 0;
                  graphData[month].leads += leads;
                } else if (key === "totalMetaLeads") {
                  graphData[month].value +=
                    (entry.metaFormLead || 0) + (entry.metaWhatsappLead || 0);
                } else {
                  graphData[month].value += entry[key] || 0;
                }
              });

              const sortedGraphData = Object.values(graphData)
                .map((data) => {
                  if (key === "metaCPL") {
                    return {
                      month: data.month,
                      value: data.leads > 0 ? data.fund / data.leads : 0,
                    };
                  }
                  return data;
                })
                .sort((a, b) =>
                  sortOrder === "asc"
                    ? dayjs(a.month, "MMM YYYY").valueOf() -
                      dayjs(b.month, "MMM YYYY").valueOf()
                    : dayjs(b.month, "MMM YYYY").valueOf() -
                      dayjs(a.month, "MMM YYYY").valueOf()
                );

              return (
                <div className="bg-white rounded-xl p-4 shadow">
                  <h3 className="text-center font-medium mb-2">{label}</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={sortedGraphData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" radius={[5, 5, 0, 0]}>
                        {sortedGraphData.map((entry, idx) => {
                          const month = entry.month.split(" ")[0];
                          const barColor = monthColors[month] || color;
                          return <Cell key={`cell-${idx}`} fill={barColor} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              );
            })}
          </div>

          {/* Google Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 min-w-[1400px] mt-6">
            {googleGraphCards.map(({ key, label, color }) => {
              const graphData = {};

              filteredGraphLeads.forEach((entry) => {
                const month = dayjs(entry.date).format("MMM YYYY");
                if (!graphData[month]) {
                  graphData[month] = { month, value: 0, fund: 0, leads: 0 };
                }

                if (key === "googleCPL") {
                  const leads =
                    (entry.googleCallLead || 0) +
                    (entry.googleWebsiteLead || 0);
                  graphData[month].fund += entry.googleFund || 0;
                  graphData[month].leads += leads;
                } else if (key === "totalGoogleLeads") {
                  graphData[month].value +=
                    (entry.googleCallLead || 0) +
                    (entry.googleWebsiteLead || 0);
                } else {
                  graphData[month].value += entry[key] || 0;
                }
              });

              const sortedGraphData = Object.values(graphData)
                .map((data) => {
                  if (key === "googleCPL") {
                    return {
                      month: data.month,
                      value: data.leads > 0 ? data.fund / data.leads : 0,
                    };
                  }
                  return data;
                })
                .sort((a, b) =>
                  sortOrder === "asc"
                    ? dayjs(a.month, "MMM YYYY").valueOf() -
                      dayjs(b.month, "MMM YYYY").valueOf()
                    : dayjs(b.month, "MMM YYYY").valueOf() -
                      dayjs(a.month, "MMM YYYY").valueOf()
                );

              return (
                <div className="bg-white rounded-xl p-4 shadow">
                  <h3 className="text-center font-medium mb-2">{label}</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={sortedGraphData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" radius={[5, 5, 0, 0]}>
                        {sortedGraphData.map((entry, idx) => {
                          const month = entry.month.split(" ")[0];
                          const barColor = monthColors[month] || color;
                          return <Cell key={`cell-${idx}`} fill={barColor} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailClient;
