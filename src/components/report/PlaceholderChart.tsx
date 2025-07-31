import Text from "./Text/Text";

interface PlaceholderChartProps {
  icon: string;
  title: string;
  width?: string;
  height?: string;
  className?: string;
}

const PlaceholderChart = ({ 
  icon, 
  title, 
  width = "w-32", 
  height = "h-32", 
  className = "" 
}: PlaceholderChartProps) => {
  return (
    <div className={`bg-white/5 p-6 rounded-lg flex items-center justify-center ${className}`}>
      <div className="text-center">
        <div className={`${width} ${height} bg-orange-400/20 rounded-lg mb-4 mx-auto flex items-center justify-center`}>
          <Text>{icon}</Text>
        </div>
        <Text>{title}</Text>
      </div>
    </div>
  );
};

export default PlaceholderChart;