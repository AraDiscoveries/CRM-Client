import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Save } from "lucide-react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Client {
  _id: string;
  clientName: string;
  status: string;
}

export const DailyLeadEntry = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState("");

  // Meta fields
  const [metaFormLead, setMetaFormLead] = useState("");
  const [metaWhatsappLead, setMetaWhatsappLead] = useState("");
  const [metaFund, setMetaFund] = useState("");
  const [metaCpl, setMetaCpl] = useState(0);

  // Google fields
  const [googleCallLead, setGoogleCallLead] = useState("");
  const [googleWebsiteLead, setGoogleWebsiteLead] = useState("");
  const [googleFund, setGoogleFund] = useState("");
  const [googleCpl, setGoogleCpl] = useState(0);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [editingLeadId, setEditingLeadId] = useState("");

  const [editMetaFormLead, setEditMetaFormLead] = useState("");
  const [editMetaWhatsappLead, setEditMetaWhatsappLead] = useState("");
  const [editMetaFund, setEditMetaFund] = useState("");
  const [editMetaCpl, setEditMetaCpl] = useState(0);

  const [editGoogleCallLead, setEditGoogleCallLead] = useState("");
  const [editGoogleWebsiteLead, setEditGoogleWebsiteLead] = useState("");
  const [editGoogleFund, setEditGoogleFund] = useState("");
  const [editGoogleCpl, setEditGoogleCpl] = useState(0);

  const [showEditSuccessModal, setShowEditSuccessModal] = useState(false);

  const [pastEntryYear, setPastEntryYear] = useState(
    new Date().getFullYear().toString()
  );
  const [pastEntryDate, setPastEntryDate] = useState("");

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await axios.get(
          "https://crm-server-f7bdb2fqa3adhjfp.eastasia-01.azurewebsites.net/api/clients"
        );
        console.log("Clients fetched:", res.data); // <-- log this!
        setClients(res.data);
      } catch (err) {
        console.error("Failed to fetch clients:", err);
      }
    };
    fetchClients();
  }, []);

  useEffect(() => {
    const totalLeads =
      (parseInt(editMetaFormLead) || 0) + (parseInt(editMetaWhatsappLead) || 0);
    const fund = parseFloat(editMetaFund) || 0;
    const cpl = totalLeads > 0 ? fund / totalLeads : 0;
    setEditMetaCpl(Number(cpl.toFixed(2)));
  }, [editMetaFormLead, editMetaWhatsappLead, editMetaFund]);

  useEffect(() => {
    const totalLeads =
      (parseInt(editGoogleCallLead) || 0) +
      (parseInt(editGoogleWebsiteLead) || 0);
    const fund = parseFloat(editGoogleFund) || 0;
    const cpl = totalLeads > 0 ? fund / totalLeads : 0;
    setEditGoogleCpl(Number(cpl.toFixed(2)));
  }, [editGoogleCallLead, editGoogleWebsiteLead, editGoogleFund]);

  useEffect(() => {
    const form = parseInt(metaFormLead) || 0;
    const whatsapp = parseInt(metaWhatsappLead) || 0;
    const fund = parseFloat(metaFund) || 0;
    const totalLeads = form + whatsapp;
    const cpl = totalLeads > 0 ? fund / totalLeads : 0;
    setMetaCpl(Number(cpl.toFixed(2)));
  }, [metaFormLead, metaWhatsappLead, metaFund]);

  useEffect(() => {
    const call = parseInt(googleCallLead) || 0;
    const site = parseInt(googleWebsiteLead) || 0;
    const fund = parseFloat(googleFund) || 0;
    const totalLeads = call + site;
    const cpl = totalLeads > 0 ? fund / totalLeads : 0;
    setGoogleCpl(Number(cpl.toFixed(2)));
  }, [googleCallLead, googleWebsiteLead, googleFund]);

  const resetFields = () => {
    setMetaFormLead("");
    setMetaWhatsappLead("");
    setMetaFund("");
    setGoogleCallLead("");
    setGoogleWebsiteLead("");
    setGoogleFund("");
    setSelectedClient("");
    setSelectedDate("");
    setEditMode(false);
    setEditingLeadId("");
  };

  const handleSaveEntry = async () => {
    if (!selectedClient) return;

    const entry = {
      clientId: selectedClient,
      clientName:
        clients.find((c) => c._id === selectedClient)?.clientName || "",
      date: new Date().toISOString().split("T")[0],
      metaFormLead: parseInt(metaFormLead) || 0,
      metaWhatsappLead: parseInt(metaWhatsappLead) || 0,
      metaFund: parseFloat(metaFund) || 0,
      metaCpl,
      googleCallLead: parseInt(googleCallLead) || 0,
      googleWebsiteLead: parseInt(googleWebsiteLead) || 0,
      googleFund: parseFloat(googleFund) || 0,
      googleCpl,
    };

    try {
      await axios.post(
        "https://crm-server-f7bdb2fqa3adhjfp.eastasia-01.azurewebsites.net/api/leads",
        entry
      );
      resetFields();
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 2500);
    } catch (err) {
      console.error("Failed to save lead entry:", err);
    }
  };

  const handleFetchEntry = async () => {
    if (!selectedClient || !selectedDate) {
      alert("Please select both client and date.");
      return;
    }

    try {
      const res = await axios.get(
        `https://crm-server-f7bdb2fqa3adhjfp.eastasia-01.azurewebsites.net/api/leads/get-lead-by-date`,
        {
          params: {
            clientId: selectedClient,
            date: selectedDate,
          },
        }
      );

      const data = res.data;
      setMetaFormLead(data.metaFormLead.toString());
      setMetaWhatsappLead(data.metaWhatsappLead.toString());
      setMetaFund(data.metaFund.toString());
      setGoogleCallLead(data.googleCallLead.toString());
      setGoogleWebsiteLead(data.googleWebsiteLead.toString());
      setGoogleFund(data.googleFund.toString());

      setEditingLeadId(data._id);
      setEditMode(true);

      setEditMetaFormLead(data.metaFormLead.toString());
      setEditMetaWhatsappLead(data.metaWhatsappLead.toString());
      setEditMetaFund(data.metaFund.toString());

      setEditGoogleCallLead(data.googleCallLead.toString());
      setEditGoogleWebsiteLead(data.googleWebsiteLead.toString());
      setEditGoogleFund(data.googleFund.toString());

      setEditingLeadId(data._id);
      setEditMode(true);
    } catch (err) {
      alert("No data found for selected client and date.");
      console.error(err);
    }
  };

  const handleUpdateEntry = async () => {
    if (!editingLeadId) return;

    const updatedData = {
      clientId: selectedClient,
      clientName:
        clients.find((c) => c._id === selectedClient)?.clientName || "",
      date: selectedDate,
      metaFormLead: parseInt(editMetaFormLead) || 0,
      metaWhatsappLead: parseInt(editMetaWhatsappLead) || 0,
      metaFund: parseFloat(editMetaFund) || 0,
      metaCpl: editMetaCpl,
      googleCallLead: parseInt(editGoogleCallLead) || 0,
      googleWebsiteLead: parseInt(editGoogleWebsiteLead) || 0,
      googleFund: parseFloat(editGoogleFund) || 0,
      googleCpl: editGoogleCpl,
    };

    try {
      await axios.put(
        `https://crm-server-f7bdb2fqa3adhjfp.eastasia-01.azurewebsites.net/api/leads/update-lead/${editingLeadId}`,
        updatedData
      );
      setShowEditSuccessModal(true);
      setTimeout(() => setShowEditSuccessModal(false), 2500);
      resetFields();
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update lead.");
    }
  };

  const handleSavePastEntry = async () => {
    if (!selectedClient || !pastEntryDate) {
      alert("Please select client, date");
      return;
    }

    const entry = {
      clientId: selectedClient,
      clientName:
        clients.find((c) => c._id === selectedClient)?.clientName || "",
      date: pastEntryDate,
      metaFormLead: parseInt(metaFormLead) || 0,
      metaWhatsappLead: parseInt(metaWhatsappLead) || 0,
      metaFund: parseFloat(metaFund) || 0,
      metaCpl,
      googleCallLead: parseInt(googleCallLead) || 0,
      googleWebsiteLead: parseInt(googleWebsiteLead) || 0,
      googleFund: parseFloat(googleFund) || 0,
      googleCpl,
    };

    try {
      await axios.post(
        "https://crm-server-f7bdb2fqa3adhjfp.eastasia-01.azurewebsites.net/api/leads",
        entry
      );
      resetFields();
      setPastEntryDate("");
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 2500);
    } catch (err) {
      console.error("Failed to save past entry:", err);
    }
  };

  return (
    <>
      <Tabs defaultValue="entry" className="space-y-6">
        <TabsList className="flex w-full justify-center bg-gray-100 rounded-xl p-1">
          <TabsTrigger value="entry" className="flex-1">
            Daily Entry
          </TabsTrigger>
          <TabsTrigger value="edit" className="flex-1">
            Edit Entry
          </TabsTrigger>
          <TabsTrigger value="past" className="flex-1">
            Add Past Entry
          </TabsTrigger>
        </TabsList>

        <TabsContent value="past">
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <Plus className="h-5 w-5" />
                Add Past Lead Entry
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Select Client */}
              <div className="space-y-2">
                <Label>Select Client</Label>
                <Select
                  value={selectedClient}
                  onValueChange={setSelectedClient}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose client..." />
                  </SelectTrigger>
                  <SelectContent>
                    {clients
                      .filter((client) => client.status !== "inactive")
                      .map((client) => (
                        <SelectItem key={client._id} value={client._id}>
                          {client.clientName}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date & IP */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Select Date</Label>
                  <Input
                    type="date"
                    max={
                      new Date(Date.now() - 86400000) // yesterday’s date
                        .toISOString()
                        .split("T")[0]
                    }
                    value={pastEntryDate}
                    onChange={(e) => setPastEntryDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Meta Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  ["Meta Form Lead", metaFormLead, setMetaFormLead],
                  ["Meta WhatsApp Lead", metaWhatsappLead, setMetaWhatsappLead],
                  ["Meta Fund", metaFund, setMetaFund],
                  ["Meta CPL", metaCpl.toString(), undefined, true],
                ].map(([label, value, setter, readOnly], i) => (
                  <div key={i} className="space-y-2">
                    <Label>{label}</Label>
                    <Input
                      type="number"
                      value={value}
                      readOnly={readOnly}
                      className={readOnly ? "bg-gray-100 text-gray-600" : ""}
                      onChange={
                        setter ? (e) => setter(e.target.value) : undefined
                      }
                    />
                  </div>
                ))}
              </div>

              {/* Google Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  ["Google Call Lead", googleCallLead, setGoogleCallLead],
                  [
                    "Google Website Lead",
                    googleWebsiteLead,
                    setGoogleWebsiteLead,
                  ],
                  ["Google Fund", googleFund, setGoogleFund],
                  ["Google CPL", googleCpl.toString(), undefined, true],
                ].map(([label, value, setter, readOnly], i) => (
                  <div key={i} className="space-y-2">
                    <Label>{label}</Label>
                    <Input
                      type="number"
                      value={value}
                      readOnly={readOnly}
                      className={readOnly ? "bg-gray-100 text-gray-600" : ""}
                      onChange={
                        setter ? (e) => setter(e.target.value) : undefined
                      }
                    />
                  </div>
                ))}
              </div>

              <Button
                onClick={handleSavePastEntry}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Past Lead Entry
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Daily Entry Tab */}
        <TabsContent value="entry">
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <Plus className="h-5 w-5" />
                Daily Lead Entry - {new Date().toLocaleDateString("en-GB")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* --- Client Selection --- */}
              <div className="space-y-2">
                <Label>Select Client</Label>
                <Select
                  value={selectedClient}
                  onValueChange={setSelectedClient}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose client..." />
                  </SelectTrigger>
                  <SelectContent>
                    {clients
                      .filter((client) => client.status !== "inactive") // 🚫 Bye-bye inactives
                      .map((client) => (
                        <SelectItem key={client._id} value={client._id}>
                          {client.clientName}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Meta Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  ["Meta Form Lead", metaFormLead, setMetaFormLead],
                  ["Meta WhatsApp Lead", metaWhatsappLead, setMetaWhatsappLead],
                  ["Meta Fund", metaFund, setMetaFund],
                  ["Meta CPL", metaCpl.toString(), undefined, true],
                ].map(([label, value, setter, readOnly], i) => (
                  <div key={i} className="space-y-2">
                    <Label>{label}</Label>
                    <Input
                      type="number"
                      value={value}
                      readOnly={readOnly}
                      className={readOnly ? "bg-gray-100 text-gray-600" : ""}
                      onChange={
                        setter ? (e) => setter(e.target.value) : undefined
                      }
                    />
                  </div>
                ))}
              </div>

              {/* Google Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  ["Google Call Lead", googleCallLead, setGoogleCallLead],
                  [
                    "Google Website Lead",
                    googleWebsiteLead,
                    setGoogleWebsiteLead,
                  ],
                  ["Google Fund", googleFund, setGoogleFund],
                  ["Google CPL", googleCpl.toString(), undefined, true],
                ].map(([label, value, setter, readOnly], i) => (
                  <div key={i} className="space-y-2">
                    <Label>{label}</Label>
                    <Input
                      type="number"
                      value={value}
                      readOnly={readOnly}
                      className={readOnly ? "bg-gray-100 text-gray-600" : ""}
                      onChange={
                        setter ? (e) => setter(e.target.value) : undefined
                      }
                    />
                  </div>
                ))}
              </div>

              <Button
                onClick={handleSaveEntry}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Daily Lead Count
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Edit Entry Tab */}
        <TabsContent value="edit">
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Save className="h-5 w-5" />
                Edit Daily Lead Entry - {new Date().toLocaleDateString("en-GB")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Client & Date in side-by-side columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Select Client</Label>
                  <Select
                    value={selectedClient}
                    onValueChange={setSelectedClient}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose client..." />
                    </SelectTrigger>
                    <SelectContent>
                      {clients
                        .filter((client) => client.status !== "inactive") // 🚫 Bye-bye inactives
                        .map((client) => (
                          <SelectItem key={client._id} value={client._id}>
                            {client.clientName}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Select Date</Label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
              </div>

              <Button
                className="w-full bg-yellow-500 hover:bg-yellow-600"
                onClick={handleFetchEntry}
              >
                Fetch & Edit Lead Count
              </Button>

              {editMode && (
                <>
                  {/* Meta Inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                      ["Meta Form Lead", editMetaFormLead, setEditMetaFormLead],
                      [
                        "Meta WhatsApp Lead",
                        editMetaWhatsappLead,
                        setEditMetaWhatsappLead,
                      ],
                      ["Meta Fund", editMetaFund, setEditMetaFund],
                      ["Meta CPL", editMetaCpl.toString(), undefined, true],
                    ].map(([label, value, setter, readOnly], i) => (
                      <div key={i} className="space-y-2">
                        <Label>{label}</Label>
                        <Input
                          type="number"
                          value={value}
                          readOnly={readOnly}
                          className={
                            readOnly ? "bg-gray-100 text-gray-600" : ""
                          }
                          onChange={
                            setter ? (e) => setter(e.target.value) : undefined
                          }
                        />
                      </div>
                    ))}
                  </div>

                  {/* Google Inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                      [
                        "Google Call Lead",
                        editGoogleCallLead,
                        setEditGoogleCallLead,
                      ],
                      [
                        "Google Website Lead",
                        editGoogleWebsiteLead,
                        setEditGoogleWebsiteLead,
                      ],
                      ["Google Fund", editGoogleFund, setEditGoogleFund],
                      ["Google CPL", editGoogleCpl.toString(), undefined, true],
                    ].map(([label, value, setter, readOnly], i) => (
                      <div key={i} className="space-y-2">
                        <Label>{label}</Label>
                        <Input
                          type="number"
                          value={value}
                          readOnly={readOnly}
                          className={
                            readOnly ? "bg-gray-100 text-gray-600" : ""
                          }
                          onChange={
                            setter ? (e) => setter(e.target.value) : undefined
                          }
                        />
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={handleUpdateEntry}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Update Lead Count
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Success Notification */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="text-center">
          <DialogHeader>
            <DialogTitle className="text-green-600 text-lg">
              ✅ Lead Entry Saved Successfully!
            </DialogTitle>
          </DialogHeader>
          <p className="text-gray-600">Your lead data has been saved.</p>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showEditSuccessModal}
        onOpenChange={setShowEditSuccessModal}
      >
        <DialogContent className="text-center">
          <DialogHeader>
            <DialogTitle className="text-green-600 text-lg">
              ✏️ Lead Data Edited Successfully!
            </DialogTitle>
          </DialogHeader>
          <p className="text-gray-600">Your changes have been saved.</p>
        </DialogContent>
      </Dialog>
    </>
  );
};
