import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  GitBranch, 
  GitMerge, 
  GitPullRequest, 
  RefreshCw, 
  Shield, 
  Terminal 
} from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    title: "Multi-Repository Sync",
    description: "Push changes to multiple repositories simultaneously with advanced sync controls",
    icon: GitBranch,
  },
  {
    title: "Force Push Protection",
    description: "Safe force push options with lease protection to prevent accidental overwrites",
    icon: Shield,
  },
  {
    title: "Real-time Monitoring",
    description: "Monitor push operations with detailed console output and status tracking",
    icon: Terminal,
  },
  {
    title: "Automated Verification",
    description: "Automatic verification of successful pushes across all target repositories",
    icon: RefreshCw,
  },
  {
    title: "Branch Management",
    description: "Comprehensive branch management with support for multiple Git workflows",
    icon: GitMerge,
  },
  {
    title: "Pull Request Integration",
    description: "Streamlined pull request creation and management across repositories",
    icon: GitPullRequest,
  },
];

export const FeatureGrid = () => {
  return (
    <div className="py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="border-border/50 bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-colors">
              <CardHeader>
                <feature.icon className="h-8 w-8 text-purple-400 mb-2" />
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};