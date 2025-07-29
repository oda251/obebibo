class CreateCompanySns < ActiveRecord::Migration[7.1]
  def change
    create_table :company_sns do |t|
      t.references :company, null: false, foreign_key: true
      t.string :sns_type, null: false
      t.string :sns_url, null: false

      t.timestamps
    end

    add_index :company_sns, [:company_id, :sns_type], unique: true
  end
end