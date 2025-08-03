import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target } from "lucide-react";
import { motion } from "framer-motion";
import { Tag } from "antd";
import { useNavigate } from "react-router-dom";

interface ClientSummary {
  clientId: string;
  clientName: string;
  metaFormLead: number;
  metaWhatsappLead: number;
  metaFund: number;
  metaCPL: number;
  googleCallLead: number;
  googleWebsiteLead: number;
  googleFund: number;
  googleCPL: number;
  totalLeads: number;
}

export const ClientLeadSummary = () => {
  const [clientSummaries, setClientSummaries] = useState<ClientSummary[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [activeClients, setActiveClients] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchActiveClients = async () => {
      try {
        const res = await axios.get(
          "https://crm-server-f7bdb2fqa3adhjfp.eastasia-01.azurewebsites.net/api/clients/active"
        );
        setActiveClients(res.data); // Set active clients
      } catch (err) {
        console.error("Error fetching active clients:", err);
      }
    };

    fetchActiveClients();
  }, []);

  useEffect(() => {
    const fetchSummaries = async () => {
      try {
        const res = await axios.get(
          "https://crm-server-f7bdb2fqa3adhjfp.eastasia-01.azurewebsites.net/api/leads/summary"
        );

        const activeClientIds = activeClients.map((client) => client._id);

        const filteredData = res.data.filter((clientSummary) =>
          activeClientIds.includes(clientSummary.clientId)
        );

        const withTotal = filteredData.map((client) => {
          const total =
            (client.metaFormLead || 0) +
            (client.metaWhatsappLead || 0) +
            (client.metaFund || 0) +
            (client.metaCPL || 0) +
            (client.googleCallLead || 0) +
            (client.googleWebsiteLead || 0) +
            (client.googleFund || 0) +
            (client.googleCPL || 0);

          return {
            ...client,
            totalLeads: total,
            metaFormLead: client.metaFormLead || 0,
            metaWhatsappLead: client.metaWhatsappLead || 0,
            metaFund: client.metaFund || 0,
            metaCPL: client.metaCPL || 0,
            googleCallLead: client.googleCallLead || 0,
            googleWebsiteLead: client.googleWebsiteLead || 0,
            googleFund: client.googleFund || 0,
            googleCPL: client.googleCPL || 0,
          };
        });

        setClientSummaries(withTotal);
        setLastUpdated(new Date().toLocaleString());
      } catch (err) {
        console.error("Failed to fetch client lead summary", err);
      }
    };

    if (activeClients.length > 0) {
      fetchSummaries();
    }
  }, [activeClients]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">
          Client Lead Summary
        </h3>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            {clientSummaries.length} Active Clients
          </Badge>
          <span className="text-xs text-gray-500">
            Updated: {lastUpdated || "Loading..."}
          </span>
        </div>
      </div>

      {clientSummaries.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center text-gray-500 py-10 border rounded bg-gray-50"
        >
          <p className="text-lg font-medium">😕 No leads found</p>
          <p className="text-sm text-gray-400">
            Either the backend is empty or it’s nap time. Check later.
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clientSummaries.map((client) => (
            <Card
              key={client.clientId}
              className="cursor-pointer shadow-md border border-transparent bg-white/90 backdrop-blur-sm transition-all relative overflow-hidden"
            >
              <div className="absolute inset-0 z-0 rounded-2xl border-2 border-pink-300 shadow-[0_0_20px_2px_rgba(255,192,203,0.6)] pointer-events-none transition-all duration-300" />
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-600" />
                    {client.clientName} -{" "}
                    {new Date().toLocaleDateString("en-GB")}
                  </span>
                  {/* <Badge variant="outline" className="text-xs">
                    {client.totalLeads} total
                  </Badge> */}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                {/* Meta Row */}
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div className="bg-purple-50 p-2 rounded text-center">
                    <span className="font-bold text-purple-700">
                      {client.metaFormLead}
                    </span>
                    <p className="text-purple-600">Meta Form</p>
                  </div>
                  <div className="bg-purple-100 p-2 rounded text-center">
                    <span className="font-bold text-purple-800">
                      {client.metaWhatsappLead}
                    </span>
                    <p className="text-purple-700">Meta WhatsApp</p>
                  </div>
                  <div className="bg-green-50 p-2 rounded text-center">
                    <span className="font-bold text-green-700">
                      {client.metaFund}
                    </span>
                    <p className="text-green-600">Meta Fund</p>
                  </div>
                  <div className="bg-yellow-50 p-2 rounded text-center">
                    <span className="font-bold text-yellow-700">
                      {client.metaCPL}
                    </span>
                    <p className="text-yellow-600">Meta CPL</p>
                  </div>
                </div>

                {/* Google Row */}
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div className="bg-blue-50 p-2 rounded text-center">
                    <span className="font-semibold text-blue-700">
                      {client.googleCallLead}
                    </span>
                    <p className="text-blue-600">Google Call</p>
                  </div>
                  <div className="bg-blue-100 p-2 rounded text-center">
                    <span className="font-bold text-blue-800">
                      {client.googleWebsiteLead}
                    </span>
                    <p className="text-blue-700">Google Website</p>
                  </div>
                  <div className="bg-green-100 p-2 rounded text-center">
                    <span className="font-bold text-green-800">
                      {client.googleFund}
                    </span>
                    <p className="text-green-700">Google Fund</p>
                  </div>
                  <div className="bg-yellow-100 p-2 rounded text-center">
                    <span className="font-bold text-yellow-800">
                      {client.googleCPL}
                    </span>
                    <p className="text-yellow-700">Google CPL</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
