// Otshepeng Lethoba - 32756356
public class InStore extends Shopping {
    // Variables
    private double plasticBagFee;
    private double discount;

    // Constructor
    public InStore(String customerName, double totalAmount) {
        setCustomerName(customerName);
        setTotalAmount(totalAmount);
        this.plasticBagFee = 0.50; // Assuming a plastic bag fee of 0.50 rand
        this.discount = 0.10; // 10% discount
    }

    // Accessors
    public double getPlasticBagFee() {
        return plasticBagFee;
    }

    public double getDiscount() {
        return discount;
    }

    // Mutators
    public void setPlasticBagFee(double plasticBagFee) {
        this.plasticBagFee = plasticBagFee;
    }

    public void setDiscount(double discount) {
        this.discount = discount;
    }

    // Abstract methods
    
    public void calculateFinalAmount() {
        double finalAmount = (getTotalAmount() * (1 - discount)) + plasticBagFee;
        setTotalAmount(finalAmount);
    }

   
    public String getShoppingType() {
        return "In-Store";
    }
	
	// toString method
	@Override
    public String toString() {
        return super.toString() + ", Plastic Bag Fee: " + plasticBagFee + ", Discount: " + discount;
    }
}
