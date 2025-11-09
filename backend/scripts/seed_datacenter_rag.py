from services.datacenter_rag import DatacenterRAG

def seed_datacenter_knowledge():
    rag = DatacenterRAG()
    
    # Inventory data
    inventory_docs = [
        {
            "content": "H100 GPU: 15 units available in warehouse. Location: Storage-A, Shelf 3. Last restocked: 2024-11-01",
            "type": "inventory",
            "metadata": {"item": "H100", "quantity": 15, "location": "Storage-A"}
        },
        {
            "content": "2m DAC cables: 0 units available. Out of stock. Expected delivery: 2024-11-15",
            "type": "inventory",
            "metadata": {"item": "2m_DAC_cable", "quantity": 0, "status": "out_of_stock"}
        },
        {
            "content": "3m DAC cables: 47 units available. Location: Storage-B, Shelf 1",
            "type": "inventory",
            "metadata": {"item": "3m_DAC_cable", "quantity": 47, "location": "Storage-B"}
        },
        {
            "content": "16-pin power cables: 23 units available. Location: Storage-A, Shelf 5",
            "type": "inventory",
            "metadata": {"item": "16pin_power", "quantity": 23, "location": "Storage-A"}
        }
    ]
    
    # Topology data
    topology_docs = [
        {
            "content": "Pod 7 contains racks 40U through 48U. Pod 7 network switch is switch-7b. Total racks: 9",
            "type": "topology",
            "metadata": {"pod": "Pod_7", "switch": "switch-7b", "rack_range": "40U-48U"}
        },
        {
            "content": "switch-7b is located in Pod 7. 48 ports total. Ports 1-24 currently in use. Ports 25-48 available",
            "type": "switch_status",
            "metadata": {"switch": "switch-7b", "pod": "Pod_7", "available_ports": 24}
        },
        {
            "content": "switch-8b is located in Pod 6. 48 ports total. Ports 1-30 currently in use. Ports 31-48 available",
            "type": "switch_status",
            "metadata": {"switch": "switch-8b", "pod": "Pod_6", "available_ports": 18}
        },
        {
            "content": "Rack 42U in Pod 7: Currently houses 8 servers. 12U of vertical space available. Power capacity: 80% utilized",
            "type": "topology",
            "metadata": {"rack": "42U", "pod": "Pod_7", "available_space": "12U"}
        }
    ]
    
    # Insert all documents
    print("Seeding inventory data...")
    for doc in inventory_docs:
        result = rag.add_document(doc["content"], doc["type"], doc["metadata"])
        print(f"Added: {doc['metadata']['item']}")
    
    print("\nSeeding topology data...")
    for doc in topology_docs:
        result = rag.add_document(doc["content"], doc["type"], doc["metadata"])
        print(f"Added: {doc['metadata']}")
    
    print("\nDatacenter RAG seeded successfully!")

if __name__ == "__main__":
    seed_datacenter_knowledge()
