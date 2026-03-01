#!/usr/bin/env python3
"""
VeriCrop FinBridge Architecture Diagram Generator
Generates a PNG architecture diagram using matplotlib and networkx
"""

import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch, ConnectionPatch
import numpy as np

def create_architecture_diagram():
    # Create figure and axis
    fig, ax = plt.subplots(1, 1, figsize=(20, 16))
    ax.set_xlim(0, 20)
    ax.set_ylim(0, 16)
    ax.axis('off')
    
    # Define colors for different layers
    colors = {
        'edge': '#E3F2FD',      # Light Blue
        'sync': '#F3E5F5',      # Light Purple
        'truth': '#FFF3E0',     # Light Orange
        'core': '#E8F5E8',      # Light Green
        'blockchain': '#FCE4EC', # Light Pink
        'financial': '#F1F8E9',  # Light Lime
        'ui': '#E1F5FE',        # Very Light Blue
        'security': '#FFEBEE'    # Light Red
    }
    
    # Title
    ax.text(10, 15.5, 'VeriCrop FinBridge - Sensor Fusion Architecture', 
            fontsize=24, fontweight='bold', ha='center')
    ax.text(10, 15, 'Disaster-Resilient Agricultural Fintech Platform', 
            fontsize=16, ha='center', style='italic')
    
    # Layer 1: Edge Computing Layer (Bottom)
    edge_box = FancyBboxPatch((0.5, 0.5), 19, 2.5, 
                              boxstyle="round,pad=0.1", 
                              facecolor=colors['edge'], 
                              edgecolor='#1976D2', linewidth=2)
    ax.add_patch(edge_box)
    ax.text(1, 2.7, 'Rural Edge Layer', fontsize=14, fontweight='bold')
    
    # Edge components
    components_edge = [
        ('📱 Farmer Mobile\nDevice', 2, 1.5),
        ('🔧 AWS IoT Greengrass v2\nEdge Gateway', 6, 1.5),
        ('🧠 Local AI Models\nCrop Damage Detection', 10, 1.5),
        ('💾 SQLite Cache\nOffline Storage', 14, 1.5),
        ('📡 4G/LTE\nConnectivity', 18, 1.5)
    ]
    
    for comp, x, y in components_edge:
        box = FancyBboxPatch((x-1, y-0.4), 2, 0.8, 
                            boxstyle="round,pad=0.05", 
                            facecolor='white', edgecolor='#1976D2')
        ax.add_patch(box)
        ax.text(x, y, comp, fontsize=9, ha='center', va='center')
    
    # Layer 2: Sync & Queue Layer
    sync_box = FancyBboxPatch((0.5, 3.5), 19, 2, 
                              boxstyle="round,pad=0.1", 
                              facecolor=colors['sync'], 
                              edgecolor='#7B1FA2', linewidth=2)
    ax.add_patch(sync_box)
    ax.text(1, 5.2, 'Connectivity & Sync Layer', fontsize=14, fontweight='bold')
    
    components_sync = [
        ('🔄 AWS AppSync\nGraphQL + Offline Sync', 4, 4.5),
        ('📬 Amazon SQS\nClaim Queue', 8, 4.5),
        ('⚡ EventBridge\nOrchestration', 12, 4.5),
        ('📊 CloudWatch\nMonitoring', 16, 4.5)
    ]
    
    for comp, x, y in components_sync:
        box = FancyBboxPatch((x-1.2, y-0.4), 2.4, 0.8, 
                            boxstyle="round,pad=0.05", 
                            facecolor='white', edgecolor='#7B1FA2')
        ax.add_patch(box)
        ax.text(x, y, comp, fontsize=9, ha='center', va='center')
    
    # Layer 3: Truth Engine - Forensic Layer
    truth_box = FancyBboxPatch((0.5, 6), 19, 2.5, 
                               boxstyle="round,pad=0.1", 
                               facecolor=colors['truth'], 
                               edgecolor='#F57C00', linewidth=2)
    ax.add_patch(truth_box)
    ax.text(1, 8.2, 'Truth Engine - Forensic Validation Layer', fontsize=14, fontweight='bold')
    
    components_truth = [
        ('👁️ Amazon Rekognition\nVideo/Image Analysis', 3, 7.2),
        ('🔒 S3 Object Lock\nImmutable Evidence', 7, 7.2),
        ('🌦️ Weather Service\nIMD Integration', 11, 7.2),
        ('🗺️ Geospatial Validator\nGPS & Shadow Analysis', 15, 7.2),
        ('🚨 Fraud Detection\nML Risk Scoring', 19, 7.2)
    ]
    
    for comp, x, y in components_truth:
        box = FancyBboxPatch((x-1.2, y-0.4), 2.4, 0.8, 
                            boxstyle="round,pad=0.05", 
                            facecolor='white', edgecolor='#F57C00')
        ax.add_patch(box)
        ax.text(x, y, comp, fontsize=8, ha='center', va='center')
    
    # Layer 4: Core Processing Engine
    core_box = FancyBboxPatch((0.5, 9), 19, 2, 
                              boxstyle="round,pad=0.1", 
                              facecolor=colors['core'], 
                              edgecolor='#388E3C', linewidth=2)
    ax.add_patch(core_box)
    ax.text(1, 10.7, 'Core Processing Engine', fontsize=14, fontweight='bold')
    
    components_core = [
        ('🔄 AWS Step Functions\nTruth Engine Orchestrator', 4, 10),
        ('⚡ AWS Lambda\nBusiness Logic', 8, 10),
        ('🗃️ DynamoDB\nClaims Database', 12, 10),
        ('⚡ ElastiCache\nSession Cache', 16, 10)
    ]
    
    for comp, x, y in components_core:
        box = FancyBboxPatch((x-1.2, y-0.4), 2.4, 0.8, 
                            boxstyle="round,pad=0.05", 
                            facecolor='white', edgecolor='#388E3C')
        ax.add_patch(box)
        ax.text(x, y, comp, fontsize=9, ha='center', va='center')
    
    # Layer 5: Blockchain Infrastructure
    blockchain_box = FancyBboxPatch((0.5, 11.5), 9, 1.8, 
                                    boxstyle="round,pad=0.1", 
                                    facecolor=colors['blockchain'], 
                                    edgecolor='#C2185B', linewidth=2)
    ax.add_patch(blockchain_box)
    ax.text(1, 13, 'Blockchain Infrastructure', fontsize=14, fontweight='bold')
    
    components_blockchain = [
        ('⛓️ Amazon Managed\nBlockchain', 3, 12.3),
        ('📜 Smart Contracts\nLoss Certificates', 7, 12.3)
    ]
    
    for comp, x, y in components_blockchain:
        box = FancyBboxPatch((x-1.2, y-0.4), 2.4, 0.8, 
                            boxstyle="round,pad=0.05", 
                            facecolor='white', edgecolor='#C2185B')
        ax.add_patch(box)
        ax.text(x, y, comp, fontsize=9, ha='center', va='center')
    
    # Layer 6: Financial Services
    financial_box = FancyBboxPatch((10.5, 11.5), 9, 1.8, 
                                   boxstyle="round,pad=0.1", 
                                   facecolor=colors['financial'], 
                                   edgecolor='#689F38', linewidth=2)
    ax.add_patch(financial_box)
    ax.text(11, 13, 'Financial Services Layer', fontsize=14, fontweight='bold')
    
    components_financial = [
        ('💰 Bridge Loan Engine\nRisk Assessment', 13, 12.3),
        ('💳 Payment Gateway\nUPI Integration', 17, 12.3)
    ]
    
    for comp, x, y in components_financial:
        box = FancyBboxPatch((x-1.2, y-0.4), 2.4, 0.8, 
                            boxstyle="round,pad=0.05", 
                            facecolor='white', edgecolor='#689F38')
        ax.add_patch(box)
        ax.text(x, y, comp, fontsize=9, ha='center', va='center')
    
    # Add key data flow arrows
    # Edge to Sync
    arrow1 = ConnectionPatch((6, 2.9), (4, 4.1), "data", "data",
                            arrowstyle="->", shrinkA=5, shrinkB=5, 
                            mutation_scale=20, fc="red", ec="red", lw=2)
    ax.add_patch(arrow1)
    
    # Sync to Truth Engine
    arrow2 = ConnectionPatch((8, 5.3), (10, 6.4), "data", "data",
                            arrowstyle="->", shrinkA=5, shrinkB=5, 
                            mutation_scale=20, fc="red", ec="red", lw=2)
    ax.add_patch(arrow2)
    
    # Truth Engine to Core
    arrow3 = ConnectionPatch((10, 8.4), (8, 9.6), "data", "data",
                            arrowstyle="->", shrinkA=5, shrinkB=5, 
                            mutation_scale=20, fc="red", ec="red", lw=2)
    ax.add_patch(arrow3)
    
    # Core to Blockchain
    arrow4 = ConnectionPatch((6, 10.4), (5, 11.9), "data", "data",
                            arrowstyle="->", shrinkA=5, shrinkB=5, 
                            mutation_scale=20, fc="red", ec="red", lw=2)
    ax.add_patch(arrow4)
    
    # Core to Financial
    arrow5 = ConnectionPatch((10, 10.4), (15, 11.9), "data", "data",
                            arrowstyle="->", shrinkA=5, shrinkB=5, 
                            mutation_scale=20, fc="red", ec="red", lw=2)
    ax.add_patch(arrow5)
    
    # Add legend for key features
    legend_box = FancyBboxPatch((0.5, 13.8), 19, 1.2, 
                                boxstyle="round,pad=0.1", 
                                facecolor='#F5F5F5', 
                                edgecolor='black', linewidth=1)
    ax.add_patch(legend_box)
    
    ax.text(1, 14.7, 'Key Features:', fontsize=12, fontweight='bold')
    features = [
        '• 60-second claim processing',
        '• Forensic fraud prevention',
        '• 72-hour offline operation',
        '• 0% interest bridge loans',
        '• Blockchain certificates',
        '• Multi-language voice UI'
    ]
    
    for i, feature in enumerate(features):
        x_pos = 1 + (i % 3) * 6
        y_pos = 14.3 - (i // 3) * 0.3
        ax.text(x_pos, y_pos, feature, fontsize=10)
    
    # Add timing annotations
    ax.text(10, 0.2, '< 60 seconds end-to-end processing', 
            fontsize=12, ha='center', fontweight='bold', 
            bbox=dict(boxstyle="round,pad=0.3", facecolor='yellow', alpha=0.7))
    
    plt.tight_layout()
    plt.savefig('.kiro/specs/vericrop-finbridge/architecture_diagram.png', 
                dpi=300, bbox_inches='tight', facecolor='white')
    plt.close()
    
    print("Architecture diagram saved as 'architecture_diagram.png'")

if __name__ == "__main__":
    create_architecture_diagram()