import json
import re
from typing import List, Dict

def parse_bind_file(bind_content: str) -> List[Dict]:
    """
    Basic parser for BIND zone files.
    Supports simple format:
    name ttl class type value
    example: www 3600 IN A 192.168.1.1
    """
    records = []
    lines = bind_content.splitlines()
    for line in lines:
        # Strip comments
        line = line.split(';')[0].strip()
        if not line:
            continue
        
        parts = re.split(r'\s+', line)
        if len(parts) >= 4:
            # Example format: example.com. 3600 IN A 192.168.1.1
            # Or without TTL: example.com. IN A 192.168.1.1
            name = parts[0]
            
            # Find the record type (A, AAAA, CNAME, TXT, MX)
            record_type = None
            type_index = -1
            for i, p in enumerate(parts):
                if p.upper() in ["A", "AAAA", "CNAME", "TXT", "MX"]:
                    record_type = p.upper()
                    type_index = i
                    break
            
            if record_type and type_index > 0:
                value = " ".join(parts[type_index+1:])
                # Remove quotes for TXT
                if record_type == "TXT" and value.startswith('"') and value.endswith('"'):
                    value = value[1:-1]
                
                # Extract TTL if available before type
                ttl = 3600
                for i in range(1, type_index):
                    if parts[i].isdigit():
                        ttl = int(parts[i])
                
                records.append({
                    "name": name,
                    "record_type": record_type,
                    "value": value,
                    "ttl": ttl
                })
    return records

def export_to_bind(domain_name: str, records: List[Dict]) -> str:
    """
    Generates a BIND file string from a list of record dictionaries.
    """
    lines = [f"$ORIGIN {domain_name}."]
    lines.append("$TTL 3600")
    lines.append("")
    
    for r in records:
        value = r["value"]
        if r["record_type"] == "TXT" and not value.startswith('"'):
            value = f'"{value}"'
            
        line = f"{r['name'].ljust(20)} {str(r['ttl']).ljust(8)} IN {r['record_type'].ljust(6)} {value}"
        lines.append(line)
        
    return "\n".join(lines)
