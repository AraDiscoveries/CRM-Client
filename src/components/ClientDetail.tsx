import { useParams } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { Table, Button } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";

export const ClientDetail = () => {
  const { id } = useParams();
  const [dailyData, setDailyData] = useState([]);

  useEffect(() => {
    const fetchDetails = async () => {
      const leadsRes = await axios.get(
        "https://crm-server-f7bdb2fqa3adhjfp.eastasia-01.azurewebsites.net/api/leads"
      );

      const filtered = leadsRes.data
        .filter((lead) => lead.clientId === id)
        .reduce((acc, lead) => {
          const date = new Date(lead.date).toLocaleDateString("en-GB");
          if (!acc[date]) {
            acc[date] = { date, meta: 0, google: 0, whatsapp: 0 };
          }
          acc[date].meta += lead.metaLeads;
          acc[date].google += lead.googleLeads;
          acc[date].whatsapp += lead.whatsappLeads;
          return acc;
        }, {});

      const daily = Object.values(filtered).map((item) => ({
        ...item,
        total: item.meta + item.google + item.whatsapp,
      }));

      setDailyData(daily);
    };

    fetchDetails();
  }, [id]);

  const handleDownload = () => {
    const worksheet = XLSX.utils.json_to_sheet(dailyData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Daily Report");
    XLSX.writeFile(workbook, `Client_Report_${id}.xlsx`);
  };

  return (
    <div className="space-y-6 px-4 py-6 bg-white rounded-xl shadow-md">
      {/* Header with button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          Client Daily Report - {id}
        </h2>
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={handleDownload}
        >
          Generate Report
        </Button>
      </div>

      {/* Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Table on the left */}
        <div className="overflow-auto border rounded-lg p-4 bg-white">
          <Table
            dataSource={dailyData}
            rowKey="date"
            columns={[
              { title: "Date", dataIndex: "date", key: "date" },
              { title: "Meta", dataIndex: "meta", key: "meta" },
              { title: "Google", dataIndex: "google", key: "google" },
              { title: "WhatsApp", dataIndex: "whatsapp", key: "whatsapp" },
              { title: "Total", dataIndex: "total", key: "total" },
            ]}
            pagination={false}
            scroll={{ x: true }}
          />
        </div>

        {/* Chart on the right */}
        <div className="p-4 bg-white border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">
            Leads Overview (Wave Style)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" angle={-45} textAnchor="end" height={60} />
              <YAxis />
              <Tooltip />
              <Legend />

              <Line
                type="monotone"
                dataKey="meta"
                stroke="#8B5CF6"
                strokeWidth={3}
                dot={{ r: 2 }}
                name="Meta"
              />
              <Line
                type="monotone"
                dataKey="google"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ r: 2 }}
                name="Google"
              />
              <Line
                type="monotone"
                dataKey="whatsapp"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ r: 2 }}
                name="WhatsApp"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
