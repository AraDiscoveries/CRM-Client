import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import {
  Users,
  TrendingUp,
  Target,
  Calendar,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Plus,
  Filter,
  Download,
  Eye,
} from "lucide-react";
import { Header } from "@/components/Header";
import { LeadCard } from "@/components/LeadCard";
import { ClientCard } from "@/components/ClientCard";
import { DailyLeadEntry } from "@/components/DailyLeadEntry";
import { ClientLeadSummary } from "@/components/ClientLeadSummary";
import AddClientModal from "@/components/AddClientModal";
import ClientList from "@/components/ClientList";
import ClientSection from "@/components/ClientList";
import LeadSummaryCards from "@/components/LeadSummaryCards";

interface DashboardStats {
  totalClients: number;
  totalLeads: number;
  todaysLeads: {
    total: number;
    meta: number;
    google: number;
    whatsapp: number;
  };
  activeChannels: string[];
}

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const [leadSourceData, setLeadSourceData] = useState([]);

  const [inactiveCount, setInactiveCount] = useState(0);

  useEffect(() => {
    axios
      .get(
        "https://crm-server-f7bdb2fqa3adhjfp.eastasia-01.azurewebsites.net/api/clients/inactive/count"
      )
      .then((res) => setInactiveCount(res.data.inactiveClients))
      .catch((err) => console.error("Error fetching inactive count:", err));
  }, []);
  const handleSearch = (query: string) => {
    const target = document.getElementById(`client-${query}`);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      target.classList.add("ring-2", "ring-blue-500");
      setTimeout(() => {
        target.classList.remove("ring-2", "ring-blue-500");
      }, 2000);
    }
  };

  // Channel performance data
  const channelPerformanceData = [
    { channel: "Meta Ads", leads: 163, clients: 3 },
    { channel: "Google Ads", leads: 124, clients: 3 },
    { channel: "WhatsApp", leads: 85, clients: 2 },
  ];

  const recentLeads = [
    {
      id: 1,
      name: "John Smith",
      company: "Tech Solutions Inc",
      email: "john@techsolutions.com",
      phone: "+1 (555) 123-4567",
      status: "qualified",
      source: "Website",
      value: 15000,
      lastContact: "2 hours ago",
    },
    {
      id: 2,
      name: "Sarah Johnson",
      company: "Marketing Pro",
      email: "sarah@marketingpro.com",
      phone: "+1 (555) 987-6543",
      status: "proposal",
      source: "Referral",
      value: 8500,
      lastContact: "4 hours ago",
    },
    {
      id: 3,
      name: "Mike Davis",
      company: "Global Enterprises",
      email: "mike@globalent.com",
      phone: "+1 (555) 456-7890",
      status: "negotiation",
      source: "Social Media",
      value: 22000,
      lastContact: "1 day ago",
    },
  ];

  const [stats, setStats] = useState({
    totalClients: 0,
    totalLeads: 0,
    todaysLeads: { total: 0, meta: 0, google: 0, whatsapp: 0 },
    activeChannels: [],
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(
          "https://crm-server-f7bdb2fqa3adhjfp.eastasia-01.azurewebsites.net/api/stats/dashboard-stats"
        );
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      }
    };

    // Fetch initially
    fetchStats();

    // Poll every 15 seconds
    const interval = setInterval(fetchStats, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header onSearch={handleSearch} />

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          {/* <h1 className="text-4xl font-bold text-gray-900 mb-2">
            ARA Discoveries CRM
          </h1> */}
          <p className="text-xl text-gray-600">
            Digital Marketing Lead Management Dashboard
          </p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4 bg-white/60 backdrop-blur-sm">
            <TabsTrigger
              value="dashboard"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              Dashboard
            </TabsTrigger>
            <TabsTrigger
              value="daily-entry"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              Daily Entry
            </TabsTrigger>
            <TabsTrigger
              value="clients"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              Clients
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Total Active Clients */}
              <Card className="bg-gradient-to-r from-purple-600 to-purple-700 text-white border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Active Clients
                  </CardTitle>
                  <Users className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.totalClients - inactiveCount}
                  </div>
                  <p className="text-xs text-purple-100">
                    Currently engaged clients
                  </p>
                </CardContent>
              </Card>

              {/* Inactive Clients */}
              <Card className="bg-gradient-to-r from-red-600 to-red-700 text-white border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Inactive Clients
                  </CardTitle>
                  <Users className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{inactiveCount}</div>
                  <p className="text-xs text-red-100">
                    Clients not active currently
                  </p>
                </CardContent>
              </Card>

              {/* Active Channels */}
              <Card className="bg-gradient-to-r from-orange-600 to-orange-700 text-white border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Channels
                  </CardTitle>
                  <DollarSign className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.activeChannels.length}
                  </div>
                  <p className="text-xs text-orange-100">
                    {stats.activeChannels.join(", ")}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Client Lead Summary */}
            <ClientLeadSummary />
          </TabsContent>

          <TabsContent value="daily-entry" className="space-y-6">
            <DailyLeadEntry />
          </TabsContent>

          <TabsContent value="leads" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                Lead Management
              </h2>
              <div className="flex gap-3">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Lead
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              {recentLeads.map((lead) => (
                <LeadCard key={lead.id} lead={lead} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="clients" className="space-y-6">
            <div className="flex justify-between items-center">
              {/* <h2 className="text-2xl font-bold text-gray-900">Client Portfolio</h2> */}
              {/* <Button className="bg-blue-600 hover:bg-blue-700"> */}
              {/* <AddClientModal onClientAdded={(newClient) => console.log('New client added:', newClient)} /> */}

              {/* </Button> */}
            </div>
            <ClientSection />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                Reports & Analytics
              </h2>
              {/* <Button className="bg-blue-600 hover:bg-blue-700">
                <Download className="h-4 w-4 mr-2" />
                Generate Report
              </Button> */}
            </div>

            <LeadSummaryCards />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
