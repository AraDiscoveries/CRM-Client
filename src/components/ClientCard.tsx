import { useState } from "react";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input, message, Modal, Switch } from "antd";
import axios from "axios";
import { MapPin, Building2 } from "lucide-react";

interface Client {
  _id: string;
  clientName: string;
  place: string;
  organisationType: string;
  createdAt: string;
  status: "active" | "inactive";
  removalReason?: string;
}

export const ClientCard = ({ client }: { client: Client }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">(client.status);
  const [displayReason, setDisplayReason] = useState(
    client.removalReason || ""
  );
  const [pendingStatus, setPendingStatus] = useState<"active" | "inactive">(
    client.status
  );

  const showModal = (newStatus: "active" | "inactive") => {
    setPendingStatus(newStatus);
    setIsModalOpen(true);
  };

  const handleToggle = (checked: boolean) => {
    const newStatus = checked ? "active" : "inactive";
    showModal(newStatus);
  };

  const handleModalOk = async () => {
    if (!reason.trim()) {
      message.error("Please enter a reason.");
      return;
    }

    try {
      await axios.patch(
        `https://crm-server-f7bdb2fqa3adhjfp.eastasia-01.azurewebsites.net/api/clients/${client._id}/status`,
        {
          status: pendingStatus,
          reason: reason.trim(),
        }
      );

      setStatus(pendingStatus);
      setDisplayReason(reason.trim());
      message.success(`Client marked as ${pendingStatus}.`);
      setIsModalOpen(false);
      setReason("");
    } catch (error) {
      console.error("Error updating client status:", error);
      message.error("Failed to update status.");
    }
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
    setReason("");
  };

  return (
    <>
      <Card className="flex flex-col p-5 shadow-md border border-gray-100 rounded-xl bg-white hover:shadow-lg transition duration-300 space-y-4">
        <div>
          <CardTitle className="text-lg font-semibold flex items-center gap-2 text-blue-700">
            <Building2 className="h-5 w-5" />
            {client.clientName}
          </CardTitle>

          <div className="flex items-center gap-2 mt-2">
            <Badge className="text-sm text-white bg-indigo-500">
              {client.organisationType}
            </Badge>
            <Badge
              className={`text-sm text-white ${
                status === "active" ? "bg-green-500" : "bg-red-500"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2 text-gray-700 text-sm">
          <MapPin className="h-4 w-4 text-gray-500" />
          <span className="font-medium">{client.place}</span>
        </div>

        <div className="text-sm text-gray-500 font-medium">
          Onboarded on:{" "}
          <span className="text-gray-800">
            {client.createdAt
              ? new Date(client.createdAt).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "Unknown"}
          </span>
        </div>

        <div className="mt-2">
          <span className="text-sm font-medium text-gray-700 mr-2">
            Toggle Status:
          </span>
          <Switch
            checked={status === "active"}
            onChange={handleToggle}
            checkedChildren="Active"
            unCheckedChildren="Inactive"
          />
        </div>

        {displayReason && (
          <div className="mt-2 text-sm text-gray-600">
            <strong>Reason:</strong> {displayReason}
          </div>
        )}
      </Card>

      <Modal
        title={`Change status to "${pendingStatus}"`}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="Confirm"
        okButtonProps={{ danger: pendingStatus === "inactive" }}
      >
        <p>Please provide a reason:</p>
        <Input.TextArea
          rows={4}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Enter reason here..."
        />
      </Modal>
    </>
  );
};
