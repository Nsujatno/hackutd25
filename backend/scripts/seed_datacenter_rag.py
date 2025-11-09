from services.datacenter_rag import DatacenterRAG

def seed_datacenter_knowledge():
    rag = DatacenterRAG()
    
    inventory_docs = [
        # --- Original Seed Data ---
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
        },
        {
            "content": "AMD EPYC 9754 CPUs: 8 units available. Location: Secure-Storage-1 (Requires Manager Approval).",
            "type": "inventory",
            "metadata": {"item": "AMD_EPYC_9754", "quantity": 8, "location": "Secure-Storage-1", "restriction": "manager_approval"}
        },
        {
            "content": "128GB DDR5 RDIMM RAM: 200 units in bulk storage. Location: Storage-C, Bin 12.",
            "type": "inventory",
            "metadata": {"item": "DDR5_128GB_RDIMM", "quantity": 200, "location": "Storage-C"}
        },
        {
            "content": "NVIDIA ConnectX-7 NICs: 12 units available. Location: Storage-A, Shelf 4. Reserved for AI cluster upgrades.",
            "type": "inventory",
            "metadata": {"item": "ConnectX-7", "quantity": 12, "location": "Storage-A", "reserved_for": "AI_cluster"}
        },
        {
            "content": "15.36TB NVMe U.3 SSDs: 5 units available. Low stock alert. Location: Storage-B, Secure Cabinet 2.",
            "type": "inventory",
            "metadata": {"item": "NVMe_15.36TB", "quantity": 5, "location": "Storage-B", "status": "low_stock"}
        },
        {
            "content": "800G OSFP Transceivers: 0 units available. Critical shortage. Next shipment expected 2024-12-05.",
            "type": "inventory",
            "metadata": {"item": "800G_OSFP_Transceiver", "quantity": 0, "status": "out_of_stock", "eta": "2024-12-05"}
        },
        {
            "content": "LC-LC Single Mode Fiber patch cables (5m): 150+ units available. Location: General-Supply-Area, Bin 4.",
            "type": "inventory",
            "metadata": {"item": "SMF_LCLC_5m", "quantity": 150, "location": "General-Supply-Area"}
        },
        {
            "content": "Rack Rail Kits (Dell R760 compatible): 18 kits available. Location: Large-Items-Bay-B.",
            "type": "inventory",
            "metadata": {"item": "Rail_Kit_R760", "quantity": 18, "location": "Large-Items-Bay-B"}
        },
        {
            "content": "Spare 2400W Titanium PSU: 14 units. Location: Storage-A, Shelf 8. Compatible with H100 chassis nodes.",
            "type": "inventory",
            "metadata": {"item": "PSU_2400W_Titanium", "quantity": 14, "location": "Storage-A"}
        },
        {
            "content": "MPO-12 to 4xLC Breakout Cables (3m): 35 units available. Location: Storage-B, Shelf 2.",
            "type": "inventory",
            "metadata": {"item": "MPO_Breakout_3m", "quantity": 35, "location": "Storage-B"}
        },
        {
            "content": "Thermal Paste (Arctic MX-6 8g tubes): 50 units. Location: Technician-Bench-Supply cabinet.",
            "type": "inventory",
            "metadata": {"item": "Thermal_Paste_MX6", "quantity": 50, "location": "Technician-Bench-Supply"}
        },
        {
            "content": "24-port 10GbE SFP+ Switches: 6 units available. Location: Network-Storage-Rack. Reserved for critical services.",
            "type": "inventory",
            "metadata": {"item": "10GbE_SFPPlus_Switch", "quantity": 6, "location": "Network-Storage-Rack", "reserved_for": "critical_services"}
        },
        {
            "content": "Backup Generator Fuel: Sufficient for 72 hours continuous operation. Last refueled 2024-11-01.",
            "type": "inventory",
            "metadata": {"item": "Backup_Generator_Fuel", "quantity": "Sufficient_72h", "last_refuel": "2024-11-01", "importance": "critical"}
        },
        {
            "content": "Spare Fans (Model X2000): 30 units available. Location: Cooling-Supply-Warehouse.",
            "type": "inventory",
            "metadata": {"item": "Spare_Fan_X2000", "quantity": 30, "location": "Cooling-Supply-Warehouse", "importance": "moderate"}
        },
        {
            "content": "Server CPU Heatsinks (Generic): 40 units in storage. Used for emergency replacements.",
            "type": "inventory",
            "metadata": {"item": "CPU_Heatsink_Generic", "quantity": 40, "location": "Storage-C", "importance": "low"}
        },
        {
            "content": "Emergency Repair Kits: 5 kits available. Contains essential tools and spare parts for urgent fixes.",
            "type": "inventory",
            "metadata": {"item": "Emergency_Repair_Kit", "quantity": 5, "location": "Tool-Room", "importance": "critical"}
        },
        {
            "content": "Fire Suppression Gas Cylinders: 10 units available. Inspection valid until 2026.",
            "type": "inventory",
            "metadata": {"item": "Fire_Suppression_Gas", "quantity": 10, "location": "Safety-Warehouse", "importance": "critical", "inspection_valid": "2026"}
        },
        {
            "content": "Optical Cleaning Kits: 50 units. Needed for fiber maintenance.",
            "type": "inventory",
            "metadata": {"item": "Optical_Cleaning_Kit", "quantity": 50, "location": "Maintenance-Shelf-7", "importance": "low"}
        }

    ]
    
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
        },
        {
            "content": "Pod 8 (AI_HighDensity) contains racks 50U through 58U. Features rear-door heat exchanger cooling. Primary switch: switch-core-8a.",
            "type": "topology",
            "metadata": {"pod": "Pod_8", "type": "AI_HighDensity", "rack_range": "50U-58U", "cooling": "RDHx"}
        },
        {
            "content": "Rack 50U in Pod 8: Completely full. 0U space available. Power capacity at 92% (Warning threshold). Houses 4x H100 nodes.",
            "type": "topology",
            "metadata": {"rack": "50U", "pod": "Pod_8", "available_space": "0U", "power_utilization": "92%", "status": "at_capacity"}
        },
        {
            "content": "Rack 55U in Pod 8: Empty. 42U space available. Provisioned for Q1 2025 expansion. Power/Network pre-wired.",
            "type": "topology",
            "metadata": {"rack": "55U", "pod": "Pod_8", "available_space": "42U", "status": "provisioned_empty"}
        },
        {
            "content": "switch-core-8a (Pod 8 Spine): 64-port 800G switch. Ports 1-32 in use for H100 fabric. Ports 33-64 reserved for expansion.",
            "type": "switch_status",
            "metadata": {"switch": "switch-core-8a", "pod": "Pod_8", "speed": "800G", "available_ports": 32}
        },
        {
            "content": "MDF-1 (Main Distribution Frame) houses spine-01 and spine-02. Connects Pods 1-8 via fiber backbone.",
            "type": "topology",
            "metadata": {"location": "MDF-1", "device_type": "spine_switches", "connects": "Pods 1-8"}
        },
        {
            "content": "Rack 33U in Pod 6 is currently OFFLINE for emergency PDU replacement. Expected back online: 2024-11-10 14:00.",
            "type": "topology",
            "metadata": {"rack": "33U", "pod": "Pod_6", "status": "offline", "maintenance_reason": "PDU_replacement"}
        },
        {
            "content": "switch-oob-management-A: Located in MDF-1. 48 ports 1G copper. Used for iDRAC/IPMI connections only. 5 ports available.",
            "type": "switch_status",
            "metadata": {"switch": "switch-oob-management-A", "type": "OOB", "available_ports": 5, "status": "near_capacity"}
        },
        {
            "content": "Cooling Zone B (CRAC units 4-6) serves Pods 6, 7, and 8. Current cooling load is 78%.",
            "type": "topology",
            "metadata": {"zone": "Cooling_B", "serves_pods": ["Pod_6", "Pod_7", "Pod_8"], "load": "78%"}
        },
        {
            "content": "Racks 10U through 15U in Pod 2 are designated as 'Warm Storage Cluster' (Ceph). High weight floor loading area.",
            "type": "topology",
            "metadata": {"pod": "Pod_2", "rack_range": "10U-15U", "designation": "Warm_Storage", "note": "high_weight"}
        },
        {
            "content": "Pod 7 Power Status: Currently running on 'B-Side' power bus only due to scheduled maintenance on Ups-A. No redundancy until 2024-11-12.",
            "type": "topology",
            "metadata": {"pod": "Pod_7", "power_status": "non-redundant", "active_bus": "B-Side", "maintenance_end": "2024-11-12"}
        }
    ]
    
    # Insert all documents
    print("Seeding inventory data...")
    for doc in inventory_docs:
        result = rag.add_document(doc["content"], doc["type"], doc["metadata"])
        print(f"Added: {doc['metadata']['item']}")
    
    print("\nSeeding topology data...")
    for doc in topology_docs:
        # Handle metadata that might not have a strictly defined 'item' equivalent for printing
        meta_id = doc["metadata"].get("switch") or doc["metadata"].get("rack") or doc["metadata"].get("pod") or "General Topology"
        result = rag.add_document(doc["content"], doc["type"], doc["metadata"])
        print(f"Added: {meta_id}")
    
    print("\nDatacenter RAG seeded successfully!")

if __name__ == "__main__":
    seed_datacenter_knowledge()