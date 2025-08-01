import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import FeaturedProducts from "@/components/FeaturedProducts";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen font-body">
      <Navigation />
      <main className="space-y-8 md:space-y-16">
        <Hero />
        <div className="space-y-12 md:space-y-20">
          <Categories />
          <FeaturedProducts />
          <Newsletter />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
