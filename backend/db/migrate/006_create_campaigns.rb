class CreateCampaigns < ActiveRecord::Migration[7.1]
  def change
    create_table :campaigns do |t|
      t.references :company, null: false, foreign_key: true
      t.string :title, null: false
      t.text :description, null: false
      t.string :image_url
      t.datetime :start_at, null: false
      t.datetime :end_at, null: false
      t.string :status, null: false, default: 'draft'

      t.timestamps
    end

    add_index :campaigns, :status
    add_index :campaigns, [:start_at, :end_at]
  end
end