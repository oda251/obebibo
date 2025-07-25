class CreateAddresses < ActiveRecord::Migration[7.1]
  def change
    create_table :addresses do |t|
      t.references :user, null: false, foreign_key: true
      t.string :postal_code, null: false
      t.string :prefecture, null: false
      t.string :city, null: false
      t.string :address1, null: false
      t.string :address2
      t.string :phone, null: false
      t.boolean :is_default, default: false

      t.timestamps
    end

    add_index :addresses, [:user_id, :is_default]
  end
end