import Paragraph from "../report/Text/Paragraph";

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
          <Paragraph>{icon}</Paragraph>
        </div>
        <Paragraph>{title}</Paragraph>
      </div>
    </div>
  );
};

export default PlaceholderChart;