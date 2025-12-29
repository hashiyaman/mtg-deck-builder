'use client';

import { memo, useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  ConnectionLineType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { SynergyAnalysis } from '@/lib/deck/synergyAnalyzer';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/types/card';

interface SynergyNetworkProps {
  synergies: SynergyAnalysis;
  cards: { card: Card; quantity: number }[];
}

/**
 * Network graph component to visualize card synergies
 */
export const SynergyNetwork = memo(function SynergyNetwork({ synergies, cards }: SynergyNetworkProps) {
  // Create nodes and edges from synergy data
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const nodeMap = new Map<string, number>(); // Track node positions
    let nodeId = 0;

    // Helper to get card display name
    const getCardName = (cardName: string) => {
      const foundCard = cards.find(c => {
        const displayName = c.card.printed_name || c.card.name;
        return displayName === cardName;
      });
      return foundCard ? (foundCard.card.printed_name || foundCard.card.name) : cardName;
    };

    // Helper to add a node
    const addNode = (cardName: string, type: string, category: string): number => {
      if (!nodeMap.has(cardName)) {
        const id = nodeId++;
        const position = {
          x: Math.random() * 600,
          y: Math.random() * 400,
        };

        nodes.push({
          id: `card-${id}`,
          type: 'default',
          data: {
            label: (
              <div className="text-xs">
                <div className="font-semibold truncate max-w-[120px]">{getCardName(cardName)}</div>
                <Badge variant="secondary" className="text-[10px] px-1 py-0 mt-0.5">
                  {category}
                </Badge>
              </div>
            ),
          },
          position,
          style: {
            background: type === 'core' ? '#e0e7ff' : '#fef3c7',
            border: '2px solid #9333ea',
            borderRadius: '8px',
            padding: '8px',
            fontSize: '12px',
          },
        });
        nodeMap.set(cardName, id);
      }
      return nodeMap.get(cardName)!;
    };

    // Process feedback loops (highest priority - core synergies)
    synergies.feedbackLoops.forEach((loop) => {
      const nodeA = addNode(loop.cardA, 'core', 'ループ');
      const nodeB = addNode(loop.cardB, 'core', 'ループ');

      edges.push({
        id: `loop-${nodeA}-${nodeB}`,
        source: `card-${nodeA}`,
        target: `card-${nodeB}`,
        type: ConnectionLineType.Bezier,
        animated: true,
        style: { stroke: '#9333ea', strokeWidth: 3 },
        label: `${loop.score}/10`,
        labelStyle: { fontSize: 10, fontWeight: 'bold' },
      });
    });

    // Process token synergies
    if (synergies.tokenSynergy) {
      const producers = synergies.tokenSynergy.producers.slice(0, 5);
      const payoffs = synergies.tokenSynergy.payoffs.slice(0, 5);

      producers.forEach((producer) => {
        const producerNode = addNode(producer, 'support', 'トークン生成');
        payoffs.forEach((payoff) => {
          const payoffNode = addNode(payoff, 'support', 'トークン活用');
          edges.push({
            id: `token-${producerNode}-${payoffNode}`,
            source: `card-${producerNode}`,
            target: `card-${payoffNode}`,
            type: ConnectionLineType.SmoothStep,
            style: { stroke: '#10b981', strokeWidth: 2 },
          });
        });
      });
    }

    // Process graveyard synergies
    if (synergies.graveyardSynergy) {
      const fillers = synergies.graveyardSynergy.graveyardFillers.slice(0, 3);
      const payoffs = synergies.graveyardSynergy.graveyardPayoffs.slice(0, 3);

      fillers.forEach((filler) => {
        const fillerNode = addNode(filler, 'support', '墓地肥やし');
        payoffs.forEach((payoff) => {
          const payoffNode = addNode(payoff, 'support', '墓地利用');
          edges.push({
            id: `grave-${fillerNode}-${payoffNode}`,
            source: `card-${fillerNode}`,
            target: `card-${payoffNode}`,
            type: ConnectionLineType.SmoothStep,
            style: { stroke: '#6b7280', strokeWidth: 2 },
          });
        });
      });
    }

    // Process sacrifice synergies
    if (synergies.sacrificeSynergy) {
      const outlets = synergies.sacrificeSynergy.outlets.slice(0, 3);
      const fodder = synergies.sacrificeSynergy.fodder.slice(0, 3);
      const payoffs = synergies.sacrificeSynergy.payoffs.slice(0, 3);

      outlets.forEach((outlet) => {
        const outletNode = addNode(outlet, 'support', '生け贄先');

        fodder.forEach((f) => {
          const fodderNode = addNode(f, 'support', '生け贄要員');
          edges.push({
            id: `sac-${fodderNode}-${outletNode}`,
            source: `card-${fodderNode}`,
            target: `card-${outletNode}`,
            type: ConnectionLineType.SmoothStep,
            style: { stroke: '#ef4444', strokeWidth: 2 },
          });
        });

        payoffs.forEach((payoff) => {
          const payoffNode = addNode(payoff, 'support', '死亡誘発');
          edges.push({
            id: `death-${outletNode}-${payoffNode}`,
            source: `card-${outletNode}`,
            target: `card-${payoffNode}`,
            type: ConnectionLineType.SmoothStep,
            style: { stroke: '#ef4444', strokeWidth: 2, strokeDasharray: '5 5' },
          });
        });
      });
    }

    return { nodes, edges };
  }, [synergies, cards]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  if (initialNodes.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center">
        <p className="text-muted-foreground">
          シナジーネットワークを表示するには、カード間の相互作用が必要です。
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4">
      <div className="mb-4">
        <h3 className="font-semibold mb-2">シナジーネットワーク</h3>
        <div className="flex gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-purple-600" style={{ width: 20 }}></div>
            <span className="text-muted-foreground">フィードバックループ</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-green-500" style={{ width: 20 }}></div>
            <span className="text-muted-foreground">トークンシナジー</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-gray-500" style={{ width: 20 }}></div>
            <span className="text-muted-foreground">墓地シナジー</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-red-500" style={{ width: 20 }}></div>
            <span className="text-muted-foreground">生け贄シナジー</span>
          </div>
        </div>
      </div>
      <div style={{ height: '500px', width: '100%' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          attributionPosition="bottom-left"
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </div>
  );
});
