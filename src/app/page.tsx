"use client";

import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  Environment,
  PerspectiveCamera,
} from "@react-three/drei";
import { BarChart, Database, ClipboardList, PieChart } from "lucide-react";
import { useRouter } from "next/navigation";

function FallbackCube({ scroll }: { scroll: number }) {
  return (
    <mesh rotation={[0, scroll * Math.PI * 2, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#6366f1" />
    </mesh>
  );
}

function Model({ scroll }: { scroll: number }) {
  // Changed from duck to dashboard or inventory-related 3D model
  const { scene } = useGLTF("/3d/chocolate_muffin.glb", true);

  if (!scene) {
    return <FallbackCube scroll={scroll} />;
  }

  return (
    <primitive
      object={scene}
      scale={[0.13, 0.13, 0.13]}
      rotation={[0, scroll * Math.PI * 2, 0]}
    />
  );
}

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#F0F7FF] to-[#F5F3FF]">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-indigo-600">
          BakeryTrack
        </Link>
        <Button
          variant="ghost"
          className="text-indigo-600 hover:text-indigo-700 cursor-pointer"
          onClick={() => router.push("/sign-in")}
        >
          Sign In
        </Button>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
            Smart Bakery
            <br />
            Inventory Management
          </h1>
          <p className="text-gray-600 mb-6 max-w-md">
            Take control of your bakery operations with our comprehensive
            inventory system. Track ingredients, monitor stock levels, and
            optimize your supply chain with real-time analytics.
          </p>
          <div className="flex gap-4">
            <Button
              className="bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer"
              onClick={() => router.push("/sign-up")}
            >
              Get Started
            </Button>
          </div>
        </motion.div>

        <div className="relative h-[400px] lg:h-[600px]">
          <Canvas className="absolute inset-0">
            <Suspense fallback={null}>
              <PerspectiveCamera makeDefault position={[0, 0, 5]} />
              <ambientLight intensity={0.5} />
              <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
              <Model scroll={rotate.get()} />
              <OrbitControls enableZoom={false} />
              <Environment preset="city" />
            </Suspense>
          </Canvas>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Powerful Inventory Features
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Everything you need to manage your bakery&apos;s inventory
            efficiently in one comprehensive solution.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            {
              icon: <Database className="w-8 h-8" />,
              name: "Ingredient Tracking",
            },
            { icon: <BarChart className="w-8 h-8" />, name: "Usage Analytics" },
            {
              icon: <ClipboardList className="w-8 h-8" />,
              name: "Recipe Management",
            },
            {
              icon: <PieChart className="w-8 h-8" />,
              name: "Demand Prediction",
            },
          ].map((feature, index) => (
            <motion.div
              key={feature.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="text-indigo-600">{feature.icon}</div>
                <h3 className="font-semibold text-gray-800">{feature.name}</h3>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section className="container mx-auto px-4 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <motion.img
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          src="/dashboard.jpeg"
          alt="Bakery inventory management"
          className="rounded-2xl shadow-2xl"
        />
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            About
            <br />
            BakeryTrack
          </h2>
          <p className="text-gray-600 mb-6">
            BakeryTrack was built by bakers, for bakers. We understand the
            unique challenges of managing bakery inventory - from fluctuating
            ingredient costs to precise recipe calculations. Our system helps
            you reduce waste, optimize ordering, and focus on what you do best:
            creating delicious baked goods.
          </p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© 2025 BakeryTrack. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
