"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

const data = [
  {
    name: "Flour",
    total: 580,
  },
  {
    name: "Sugar",
    total: 413,
  },
  {
    name: "Butter",
    total: 328,
  },
  {
    name: "Eggs",
    total: 246,
  },
  {
    name: "Milk",
    total: 235,
  },
  {
    name: "Vanilla",
    total: 189,
  },
  {
    name: "Cocoa",
    total: 142,
  },
]

export function Overview() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}kg`}
        />
        <Tooltip />
        <Bar dataKey="total" fill="#adfa1d" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

