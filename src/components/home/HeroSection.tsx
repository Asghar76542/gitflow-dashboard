import { Button } from "@/components/ui/button";
import { GitBranch, GitMerge, GitPullRequest } from "lucide-react";
import { motion } from "framer-motion";

export const HeroSection = () => {
  return (
    <div className="relative py-20 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-20" />
        <div className="absolute top-0 left-0 w-full h-full bg-grid-white/[0.02]" />
      </div>

      <div className="relative z-10 text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500">
            Git Repository Management
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Seamlessly sync and manage multiple Git repositories with advanced push controls
            and real-time monitoring.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center gap-4 flex-wrap"
        >
          <Button size="lg" className="group">
            <GitBranch className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
            Get Started
          </Button>
          <Button size="lg" variant="outline">
            Learn More
          </Button>
        </motion.div>

        {/* Animated Icons */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="flex justify-center gap-8 pt-8"
        >
          <GitBranch className="h-12 w-12 text-purple-400 animate-pulse" />
          <GitMerge className="h-12 w-12 text-blue-400 animate-pulse delay-100" />
          <GitPullRequest className="h-12 w-12 text-purple-400 animate-pulse delay-200" />
        </motion.div>
      </div>
    </div>
  );
};