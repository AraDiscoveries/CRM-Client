import React, { useState } from "react";
import axios from "axios";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const AddClientModal = ({ onClientAdded }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    clientName: "",
    place: "",
    organisationType: "",
    address: "", // ✅ New
    gstNumber: "", // ✅ New
  });
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "https://crm-server-f7bdb2fqa3adhjfp.eastasia-01.azurewebsites.net/api/clients",
        formData
      );
      onClientAdded(res.data);
      setSuccessMessage("Client added successfully!");
      setFormData({
        clientName: "",
        place: "",
        organisationType: "",
        address: "",
        gstNumber: "",
      });
      console.log("Created client:", res.data);

      setTimeout(() => setSuccessMessage(""), 3000);
      setTimeout(() => setOpen(false), 1000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <Button
        className="bg-blue-600 hover:bg-blue-700"
        onClick={() => setOpen(true)}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Client
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
          </DialogHeader>

          {successMessage && (
            <div className="bg-green-100 text-green-800 p-2 rounded text-sm mb-2">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Client Name"
              value={formData.clientName}
              onChange={(e) =>
                setFormData({ ...formData, clientName: e.target.value })
              }
              className="w-full p-2 border"
              required
            />
            <input
              type="text"
              placeholder="Place"
              value={formData.place}
              onChange={(e) =>
                setFormData({ ...formData, place: e.target.value })
              }
              className="w-full p-2 border"
              required
            />
            <input
              type="text"
              placeholder="Type of Organisation"
              value={formData.organisationType}
              onChange={(e) =>
                setFormData({ ...formData, organisationType: e.target.value })
              }
              className="w-full p-2 border"
              required
            />
            <input
              type="text"
              placeholder="Address"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              className="w-full p-2 border"
              required
            />

            <input
              type="text"
              placeholder="GST Number"
              value={formData.gstNumber}
              onChange={(e) =>
                setFormData({ ...formData, gstNumber: e.target.value })
              }
              className="w-full p-2 border"
              required
            />

            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              Submit
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddClientModal;
