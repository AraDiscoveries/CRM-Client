import React, { useEffect, useState } from "react";
import axios from "axios";
import { ClientCard } from "./ClientCard";
import AddClientModal from "./AddClientModal";

interface Client {
  _id: string;
  clientName: string;
  place: string;
  organisationType: string;
}

const ClientSection = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClients = async () => {
    try {
      const res = await axios.get(
        "https://crm-server-f7bdb2fqa3adhjfp.eastasia-01.azurewebsites.net/api/clients"
      );
      setClients(res.data);
    } catch (err) {
      console.error("Error fetching clients", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleClientAdded = (newClient: Client) => {
    console.log("Adding to state:", newClient);
    setClients((prev) => [newClient, ...prev]);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Client Portfolio</h2>
        <AddClientModal onClientAdded={handleClientAdded} />
      </div>

      {loading ? (
        <p>Loading clients...</p>
      ) : clients.length === 0 ? (
        <p>No clients found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client) => (
            <ClientCard key={client._id} client={client} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientSection;
