class CreateShipments < ActiveRecord::Migration[7.1]
  def change
    create_table :shipments do |t|
      t.references :entry, null: false, foreign_key: true
      t.references :address, null: false, foreign_key: true
      t.datetime :shipped_at
      t.string :status, null: false, default: 'preparing'

      t.timestamps
    end

    add_index :shipments, :status
    add_index :shipments, :shipped_at
  end
end