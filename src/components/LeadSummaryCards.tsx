import { useEffect, useState } from "react";
import axios from "axios";
import { Loader2, Users, Facebook, Search } from "lucide-react";
import { Link } from "react-router-dom";

const LeadSummaryCards = () => {
  const [clientSummaries, setClientSummaries] = useState([]);
  const [activeClients, setActiveClients] = useState([]);
  const [lastUpdated, setLastUpdated] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Step 1: Get active clients
        const activeRes = await axios.get(
          "https://crm-server-f7bdb2fqa3adhjfp.eastasia-01.azurewebsites.net/api/clients/active"
        );
        const activeClientIds = activeRes.data.map((client) => client._id);

        // Step 2: Get all summaries
        const summaryRes = await axios.get(
          "https://crm-server-f7bdb2fqa3adhjfp.eastasia-01.azurewebsites.net/api/leads/summary"
        );

        // Step 3: Filter by active clients only
        const filteredData = summaryRes.data.filter((clientSummary) =>
          activeClientIds.includes(clientSummary.clientId)
        );

        // Step 4: Add totalLeads field
        const withTotal = filteredData.map((client) => {
          const total =
            (client.metaFormLead || 0) +
            (client.metaWhatsappLead || 0) +
            (client.googleCallLead || 0) +
            (client.googleWebsiteLead || 0);

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
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="animate-spin h-6 w-6 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-right text-gray-500">
        Last updated: {lastUpdated}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {clientSummaries.map((client) => (
          <Link to={`/clients/${client.clientId}`} key={client.clientId}>
            <div className="rounded-2xl p-5 bg-white/60 backdrop-blur-md shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
              <div className="absolute -top-5 -right-5 w-24 h-24 bg-gradient-to-tr from-blue-200 to-indigo-300 rounded-full opacity-20"></div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-indigo-600" />
                  <h3 className="text-lg font-semibold text-indigo-900">
                    {client.clientName}
                  </h3>
                </div>
              </div>

              <div className="flex justify-center mb-5">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-white flex items-center justify-center text-2xl font-bold shadow-lg">
                  {client.totalLeads}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="flex items-center gap-1 text-indigo-600 font-semibold mb-2">
                    <Facebook className="h-4 w-4" />
                    Meta Leads
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Form", value: client.metaFormLead },
                      { label: "WhatsApp", value: client.metaWhatsappLead },
                      { label: "Fund", value: client.metaFund },
                      { label: "CPL", value: client.metaCPL },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-indigo-50 rounded-lg p-2 text-center shadow-sm"
                      >
                        <div className="text-xs text-gray-600">
                          {item.label}
                        </div>
                        <div className="font-semibold text-indigo-800 text-lg">
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1 text-green-600 font-semibold mb-2">
                    <Search className="h-4 w-4" />
                    Google Leads
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Call", value: client.googleCallLead },
                      { label: "Website", value: client.googleWebsiteLead },
                      { label: "Fund", value: client.googleFund },
                      { label: "CPL", value: client.googleCPL },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-green-50 rounded-lg p-2 text-center shadow-sm"
                      >
                        <div className="text-xs text-gray-600">
                          {item.label}
                        </div>
                        <div className="font-semibold text-green-800 text-lg">
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default LeadSummaryCards;
