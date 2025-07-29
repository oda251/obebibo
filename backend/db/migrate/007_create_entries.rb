class CreateEntries < ActiveRecord::Migration[7.1]
  def change
    create_table :entries do |t|
      t.references :user, null: false, foreign_key: true
      t.references :campaign, null: false, foreign_key: true
      t.string :status, null: false, default: 'pending'

      t.timestamps
    end

    add_index :entries, [:user_id, :campaign_id], unique: true
    add_index :entries, :status
  end
end