class CreateCompanies < ActiveRecord::Migration[7.1]
  def change
    create_table :companies do |t|
      t.string :name, null: false
      t.string :email, null: false
      t.string :encrypted_password, null: false, default: ""
      t.string :contact_name, null: false
      t.string :contact_phone, null: false
      t.string :postal_code, null: false
      t.string :prefecture, null: false
      t.string :city, null: false
      t.string :address1, null: false
      t.string :address2
      t.string :url

      t.timestamps
    end

    add_index :companies, :email, unique: true
  end
end