class CreateReviews < ActiveRecord::Migration[7.1]
  def change
    create_table :reviews do |t|
      t.references :user, null: false, foreign_key: true
      t.references :campaign, null: false, foreign_key: true
      t.integer :rating, null: false
      t.text :comment, null: false

      t.timestamps
    end

    add_index :reviews, [:user_id, :campaign_id], unique: true
    add_index :reviews, :rating
  end
end