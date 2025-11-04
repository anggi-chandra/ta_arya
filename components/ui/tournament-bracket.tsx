"use client";

import React from "react";
import { Card } from "@/components/ui/card";

export interface BracketMatch {
  match: number;
  team1: string;
  team2: string;
  score: string;
  winner: string;
}

export interface BracketRound {
  round: string;
  matches: BracketMatch[];
}

export function TournamentBracket({ bracket }: { bracket: BracketRound[] }) {
  return (
    <div className="w-full overflow-x-auto">
      <div className="flex gap-6 min-w-full">
        {bracket.map((round, roundIdx) => (
          <div key={roundIdx} className="min-w-[260px]">
            <h3 className="text-lg font-semibold mb-3">{round.round}</h3>
            <div className="space-y-3">
              {round.matches.map((m) => (
                <Card key={m.match} className="p-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{m.team1}</span>
                      <span className="text-sm text-muted-foreground">vs</span>
                      <span className="font-medium">{m.team2}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Skor</span>
                      <span className="text-sm font-semibold">{m.score}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Pemenang</span>
                      <span className="text-sm font-semibold">{m.winner}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}